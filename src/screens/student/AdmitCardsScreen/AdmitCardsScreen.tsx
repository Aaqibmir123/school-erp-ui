import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as FileSystem from "expo-file-system";
import { StorageAccessFramework } from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { APP_ENV } from "@/src/config/env";
import { useAuth } from "@/src/context/AuthContext";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";
import { showToast } from "@/src/utils/toast";
import { useGetMyAdmitCardsQuery } from "../../../api/student/student.api";

const resolveCardUrl = (pdfUrl?: string | null) => {
  if (!pdfUrl) return null;
  if (/^https?:\/\//i.test(pdfUrl)) return pdfUrl;
  return `${APP_ENV.SERVER_URL}${pdfUrl.startsWith("/") ? "" : "/"}${pdfUrl}`;
};

const formatDate = (date: string) => {
  const d = new Date(date);
  return `${d.getDate()} ${d.toLocaleString("default", {
    month: "short",
  })}`;
};

export default function AdmitCardsScreen() {
  const { selectedStudent } = useAuth();
  const { data: admitCards = [], isLoading, isError, refetch } =
    useGetMyAdmitCardsQuery(
      { studentId: selectedStudent?._id },
      {
        skip: !selectedStudent?._id,
      },
    );

  const [activeId, setActiveId] = useState<string | null>(null);

  const downloadToCache = async (pdfUrl: string, id: string) => {
    const resolved = resolveCardUrl(pdfUrl);
    if (!resolved) {
      throw new Error("Admit card not available");
    }

    const fileName = pdfUrl.split("/").pop() || `admit-card-${id}.pdf`;
    const safeFileName = fileName.endsWith(".pdf")
      ? fileName
      : `${fileName}.pdf`;
    const file = await FileSystem.File.downloadFileAsync(
      resolved,
      new FileSystem.File(FileSystem.Paths.cache, safeFileName),
      { idempotent: true },
    );

    return file;
  };

  const saveToDevice = async (pdfUrl: string, id: string) => {
    const downloaded = await downloadToCache(pdfUrl, id);
    const fileName = downloaded.uri.split("/").pop() || `admit-card-${id}.pdf`;

    if (Platform.OS === "android") {
      const permission =
        await StorageAccessFramework.requestDirectoryPermissionsAsync(
          StorageAccessFramework.getUriForDirectoryInRoot("Download"),
        );

      if (!permission.granted) {
        throw new Error("Storage permission denied");
      }

      const base64 = await downloaded.base64();
      const destUri = await StorageAccessFramework.createFileAsync(
        permission.directoryUri,
        fileName.replace(/\.pdf$/i, ""),
        "application/pdf",
      );

      await StorageAccessFramework.writeAsStringAsync(destUri, base64, {
        encoding: "base64",
      });

      return destUri;
    }

    return downloaded.uri;
  };

  const handleViewCard = async (pdfUrl?: string | null) => {
    const resolved = resolveCardUrl(pdfUrl);
    if (!resolved) {
      showToast.error("Admit card not available");
      return;
    }

    try {
      await WebBrowser.openBrowserAsync(resolved);
    } catch {
      showToast.error("Unable to open admit card");
    }
  };

  const handleDownloadCard = async (pdfUrl: string, id: string) => {
    try {
      setActiveId(id);
      const savedUri = await saveToDevice(pdfUrl, id);

      if (Platform.OS !== "android" && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(savedUri, {
          dialogTitle: "Save admit card",
          mimeType: "application/pdf",
        });
      }

      showToast.success(
        Platform.OS === "android"
          ? "Admit card saved to Downloads"
          : "Admit card downloaded",
      );
    } catch (error: any) {
      showToast.error(error?.message || "Download failed");
    } finally {
      setActiveId(null);
    }
  };

  const handleShareCard = async (pdfUrl: string, id: string) => {
    try {
      setActiveId(id);
      const downloaded = await downloadToCache(pdfUrl, id);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloaded.uri, {
          dialogTitle: "Share admit card",
          mimeType: "application/pdf",
        });
      } else {
        showToast.info("Sharing is not available on this device");
      }
    } catch {
      showToast.error("Share failed");
    } finally {
      setActiveId(null);
    }
  };

  if (isLoading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  if (isError) {
    return (
      <Text style={styles.empty} onPress={refetch}>
        Tap to retry
      </Text>
    );
  }

  return (
    <FlatList
      data={admitCards}
      keyExtractor={(item: any) => item._id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
      ListHeaderComponent={
        <View style={styles.headerWrap}>
          <LinearGradient
            colors={["#ffffff", "#f8fafc"]}
            style={styles.headerCard}
          >
            <View style={styles.headerRow}>
              <View style={styles.headerIcon}>
                <Ionicons name="card-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>Admit Cards</Text>
                <Text style={styles.headerSub}>
                  Open, save, or share your approved exam cards
                </Text>
              </View>
              <View style={styles.countPill}>
                <Text style={styles.countText}>{admitCards.length}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.empty}>No approved admit cards yet</Text>
      }
      renderItem={({ item }: any) => {
        const sectionLabel =
          item.sectionName !== "All"
            ? `${item.className} - ${item.sectionName}`
            : item.className;

        return (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.examName}>{item.examName}</Text>
                <Text style={styles.examMeta}>{sectionLabel}</Text>
              </View>
              <View style={styles.rollBadge}>
                <Text style={styles.rollLabel}>Roll No</Text>
                <Text style={styles.rollValue}>{item.rollNumber}</Text>
              </View>
            </View>

            <View style={styles.chipsRow}>
              <View style={styles.examTypeChip}>
                <Text style={styles.examTypeText}>{item.examType}</Text>
              </View>
              <View style={styles.softChip}>
                <Text style={styles.softChipText}>
                  {item.className}
                  {item.sectionName !== "All" ? ` • ${item.sectionName}` : ""}
                </Text>
              </View>
              {item.date ? (
                <View style={styles.dateChip}>
                  <Text style={styles.dateChipText}>{formatDate(item.date)}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.actions}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.viewBtn,
                  pressed && styles.pressed,
                ]}
                onPress={() => handleViewCard(item.pdfUrl)}
              >
                <Ionicons name="eye-outline" size={16} color={COLORS.primary} />
                <Text style={styles.viewText}>View</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.downloadBtn,
                  pressed && styles.pressed,
                ]}
                onPress={() => item.pdfUrl && handleDownloadCard(item.pdfUrl, item._id)}
              >
                <Ionicons name="download-outline" size={16} color={COLORS.info} />
                <Text style={styles.downloadText}>
                  {activeId === item._id ? "Saving..." : "Save"}
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.shareBtn,
                  pressed && styles.pressed,
                ]}
                onPress={() => item.pdfUrl && handleShareCard(item.pdfUrl, item._id)}
              >
                <Ionicons name="share-social-outline" size={16} color={COLORS.success} />
                <Text style={styles.shareText}>
                  {activeId === item._id ? "Sharing..." : "Share"}
                </Text>
              </Pressable>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 10,
  },
  headerCard: {
    backgroundColor: "#fff",
    borderColor: "#e2e8f0",
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    ...SHADOWS.soft,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  headerIcon: {
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  headerSub: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  countPill: {
    alignItems: "center",
    backgroundColor: "#1d4ed8",
    borderRadius: 999,
    height: 40,
    justifyContent: "center",
    minWidth: 40,
    paddingHorizontal: 12,
  },
  countText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  card: {
    backgroundColor: "#fff",
    borderColor: "#e2e8f0",
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 14,
    marginBottom: SPACING.md,
    padding: 16,
    ...SHADOWS.soft,
  },
  cardTop: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  examName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  examMeta: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  rollBadge: {
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 18,
    minWidth: 78,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rollLabel: {
    color: COLORS.textTertiary,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  rollValue: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 2,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  examTypeChip: {
    backgroundColor: "#eff6ff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  examTypeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  softChip: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  softChipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  dateChip: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dateChipText: {
    color: COLORS.info,
    fontSize: 12,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  actionBtn: {
    alignItems: "center",
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 42,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  viewBtn: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
    borderWidth: 1,
  },
  downloadBtn: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
    borderWidth: 1,
  },
  shareBtn: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
    borderWidth: 1,
  },
  viewText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  downloadText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  shareText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  empty: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 60,
    textAlign: "center",
  },
});

