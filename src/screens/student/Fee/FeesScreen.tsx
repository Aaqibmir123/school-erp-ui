import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as WebBrowser from "expo-web-browser";
import { memo, useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import FallbackBanner from "@/src/components/FallbackBanner";
import { APP_ENV } from "@/src/config/env";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";
import { showToast } from "@/src/utils/toast";
import { useGetMyFeesQuery } from "../../../api/student/student.api";

type FeeItem = {
  _id: string;
  feeType: string;
  month: string;
  paidAmount: number;
  paidDate?: string;
  pdfUrl?: string | null;
  remainingAmount: number;
  status: "paid" | "partial" | "unpaid";
  totalAmount: number;
};

const resolveReceiptUrl = (pdfUrl?: string | null) => {
  if (!pdfUrl) return null;
  if (/^https?:\/\//i.test(pdfUrl)) return pdfUrl;
  return `${APP_ENV.SERVER_URL}${pdfUrl.startsWith("/") ? "" : "/"}${pdfUrl}`;
};

const buildReceiptFileUri = (pdfUrl: string, id: string) => {
  const fileName = pdfUrl.split("/").pop() || `receipt-${id}.pdf`;
  const safeFileName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
  return new FileSystem.File(FileSystem.Paths.cache, safeFileName);
};

function FeesScreen() {
  const { data = [], isLoading, isFetching, isError, refetch } = useGetMyFeesQuery();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const feeItems = useMemo(() => data as FeeItem[], [data]);

  const handleDownloadAndShare = useCallback(async (pdfUrl: string, id: string) => {
    try {
      setDownloadingId(id);

      const resolvedUrl = resolveReceiptUrl(pdfUrl);
      if (!resolvedUrl) {
        throw new Error("Receipt URL missing");
      }

      const targetFile = buildReceiptFileUri(pdfUrl, id);
      const downloadedFile = await FileSystem.File.downloadFileAsync(
        resolvedUrl,
        targetFile,
        { idempotent: true },
      );

      showToast.success("Receipt downloaded");

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadedFile.uri, {
          dialogTitle: "Share receipt",
          mimeType: "application/pdf",
        });
      }
    } catch (error) {
      console.error("Receipt download failed:", error);
      showToast.error("Download failed");
    } finally {
      setDownloadingId(null);
    }
  }, []);

  const handleViewReceipt = useCallback(async (pdfUrl?: string | null) => {
    const resolvedUrl = resolveReceiptUrl(pdfUrl);
    if (!resolvedUrl) {
      showToast.error("Receipt not available");
      return;
    }

    try {
      await WebBrowser.openBrowserAsync(resolvedUrl);
    } catch (error) {
      console.error("Receipt preview failed:", error);
      showToast.error("Preview unavailable");
    }
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: FeeItem }) => {
      const isPaid = item.status === "paid";
      const isPartial = item.status === "partial";
      const hasReceipt = Boolean(item.pdfUrl);

      return (
        <View style={styles.card}>
          <View style={styles.receiptHeader}>
            <View style={styles.receiptIcon}>
              <Text style={styles.receiptIconText}>R</Text>
            </View>
            <View style={styles.receiptHeaderText}>
              <Text style={styles.month}>{item.month}</Text>
              <Text style={styles.type}>{item.feeType?.toUpperCase()} FEE</Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <View
              style={[
                styles.badge,
                isPaid
                  ? styles.badgeGreen
                  : isPartial
                    ? styles.badgeOrange
                    : styles.badgeRed,
              ]}
            >
              <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
            </View>
            {item.paidDate ? (
              <Text style={styles.date}>
                Paid on {new Date(item.paidDate).toLocaleDateString()}
              </Text>
            ) : (
              <Text style={styles.date}>Receipt ready for review</Text>
            )}
          </View>

          <View style={styles.receiptGrid}>
            <View style={styles.receiptBox}>
              <Text style={styles.label}>Total Amount</Text>
              <Text style={styles.total}>Rs. {item.totalAmount}</Text>
            </View>
            <View style={styles.receiptBox}>
              <Text style={styles.label}>Paid Amount</Text>
              <Text style={styles.paid}>Rs. {item.paidAmount}</Text>
            </View>
            <View style={styles.receiptBox}>
              <Text style={styles.label}>Pending</Text>
              <Text
                style={[
                  styles.remaining,
                  item.remainingAmount > 0 ? styles.remainingRed : styles.remainingGreen,
                ]}
              >
                Rs. {item.remainingAmount}
              </Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            {hasReceipt ? (
              <TouchableOpacity
                style={[styles.button, styles.viewBtn]}
                onPress={() => handleViewReceipt(item.pdfUrl)}
              >
                <Text style={styles.buttonText}>View Receipt</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              disabled={!hasReceipt || downloadingId === item._id}
              style={[
                styles.button,
                hasReceipt ? styles.downloadBtn : styles.buttonDisabled,
              ]}
              onPress={() => item.pdfUrl && handleDownloadAndShare(item.pdfUrl, item._id)}
            >
              <Text style={styles.buttonText}>
                {downloadingId === item._id
                  ? "Downloading..."
                  : hasReceipt
                    ? "Download PDF"
                    : "No Receipt"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [downloadingId, handleDownloadAndShare],
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <FallbackBanner
          title="Fee history unavailable"
          subtitle="We could not load the payment records right now."
          onRetry={refetch}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={feeItems}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
      ListEmptyComponent={
        <FallbackBanner
          title="No fee records"
          subtitle="Fees and receipts will appear here once the admin publishes them."
          onRetry={refetch}
        />
      }
      maxToRenderPerBatch={8}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      removeClippedSubviews
      showsVerticalScrollIndicator={false}
      windowSize={7}
    />
  );
}

export default memo(FeesScreen);

const styles = StyleSheet.create({
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.lg,
  },
  badge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  badgeGreen: {
    backgroundColor: COLORS.success,
  },
  badgeOrange: {
    backgroundColor: COLORS.warning,
  },
  badgeRed: {
    backgroundColor: COLORS.danger,
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textInverse,
    fontWeight: "800",
  },
  button: {
    alignItems: "center",
    borderRadius: RADIUS.md,
    flex: 1,
    paddingVertical: SPACING.sm,
  },
  buttonDisabled: {
    backgroundColor: COLORS.border,
  },
  buttonRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  buttonText: {
    color: COLORS.textInverse,
    fontWeight: "700",
  },
  card: {
    ...SHADOWS.card,
    backgroundColor: COLORS.card,
    borderRadius: 28,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  center: {
    alignItems: "center",
    backgroundColor: COLORS.background,
    flex: 1,
    justifyContent: "center",
    padding: SPACING.lg,
  },
  container: {
    backgroundColor: COLORS.background,
    flexGrow: 1,
    padding: SPACING.lg,
  },
  date: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 0,
  },
  downloadBtn: {
    backgroundColor: COLORS.primary,
  },
  receiptHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: SPACING.md,
  },
  receiptHeaderText: {
    flex: 1,
  },
  receiptIcon: {
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.full,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  receiptIconText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "900",
  },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  month: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.textPrimary,
  },
  paid: {
    ...TYPOGRAPHY.body,
    color: COLORS.success,
    fontWeight: "800",
  },
  remaining: {
    ...TYPOGRAPHY.body,
    fontWeight: "800",
  },
  remainingGreen: {
    color: COLORS.success,
  },
  remainingRed: {
    color: COLORS.danger,
  },
  total: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: "800",
  },
  type: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  receiptGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  receiptBox: {
    backgroundColor: COLORS.cardMuted,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 96,
    padding: SPACING.md,
  },
  statusRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.md,
  },
  viewBtn: {
    backgroundColor: COLORS.success,
  },
});
