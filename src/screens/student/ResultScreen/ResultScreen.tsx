import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import { APP_ENV } from "@/src/config/env";
import { useGetMyMarksQuery } from "@/src/api/student/student.api";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/src/theme";
import { Image } from "expo-image";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type MarksCardPreview = {
  exam?: {
    marksCardStatus?: "draft" | "approved";
    name?: string;
    examType?: string;
  };
  pdfUrl?: string;
  previewUrl?: string;
  school?: {
    name?: string;
  };
};

const resolveImageUri = (image?: string | null) => {
  if (!image) return null;
  if (/^https?:\/\//i.test(image)) return image;
  return `${APP_ENV.SERVER_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};

export default function StudentResultScreen() {
  const { selectedStudent } = useAuth();

  const { data: marksCard = {}, isLoading, isError, refetch } = useGetMyMarksQuery(
    { studentId: selectedStudent?._id! },
    { skip: !selectedStudent?._id },
  );

  const preview = marksCard as MarksCardPreview;
  const previewUri = resolveImageUri(preview.previewUrl || null);
  const pdfUri = resolveImageUri(preview.pdfUrl || null);

  const openPdf = async () => {
    if (!pdfUri) return;
    await Linking.openURL(pdfUri);
  };

  if (!selectedStudent?._id) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.empty}>Student not selected.</Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Marks</Text>
        <Text style={styles.title}>Approved marks card</Text>
        <Text style={styles.subtitle}>
          Only approved school exam marks sheets appear here.
        </Text>
      </View>

      <View style={styles.sheetCard}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Marks card preview</Text>
            <Text style={styles.sectionSub}>Backend-generated PDF-style result sheet</Text>
          </View>

          <Pressable style={styles.refreshBtn} onPress={() => refetch()}>
            <Ionicons name="refresh-outline" size={16} color={COLORS.primary} />
            <Text style={styles.refreshText}>{isLoading ? "Loading" : "Refresh"}</Text>
          </Pressable>
        </View>

        {isError || !previewUri ? (
          <View style={styles.emptySheet}>
            <Ionicons name="document-text-outline" size={30} color={COLORS.primary} />
            <Text style={styles.emptySheetTitle}>No approved marks sheet yet</Text>
            <Text style={styles.emptySheetText}>
              Only approved school exam marks sheets are shown here.
            </Text>
          </View>
        ) : (
          <>
            <Image
              source={{ uri: previewUri }}
              style={styles.previewImage}
              contentFit="contain"
            />

            <View style={styles.actionsRow}>
              <Pressable style={styles.actionBtnPrimary} onPress={openPdf} disabled={!pdfUri}>
                <Ionicons name="download-outline" size={16} color="#fff" />
                <Text style={styles.actionTextPrimary}>Open PDF</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  actionBtnPrimary: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    paddingVertical: 12,
  },
  actionTextPrimary: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  container: {
    backgroundColor: "#F4F8FF",
    paddingBottom: SPACING.xxl,
  },
  empty: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
  emptySheet: {
    alignItems: "center",
    backgroundColor: "#F8FBFF",
    borderColor: "#E5EEFC",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: 8,
    padding: 18,
  },
  emptySheetText: {
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  emptySheetTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  emptyWrap: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  hero: {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 22,
    paddingHorizontal: 16,
    paddingTop: 28,
  },
  eyebrow: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  title: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "900",
    marginTop: 2,
  },
  subtitle: {
    color: "rgba(255,255,255,0.86)",
    marginTop: 4,
  },
  previewImage: {
    alignSelf: "stretch",
    aspectRatio: 0.75,
    borderRadius: RADIUS.lg,
    width: "100%",
  },
  refreshBtn: {
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.full,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  refreshText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "900",
  },
  sheetCard: {
    ...SHADOWS.card,
    backgroundColor: "#fff",
    borderColor: "#e5eefc",
    borderRadius: RADIUS.xl,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.md,
  },
});
