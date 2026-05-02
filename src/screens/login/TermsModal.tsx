import { MaterialIcons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "../../theme";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function TermsModal({ visible, onClose }: Props) {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Terms & Conditions</Text>
              <Text style={styles.subtitle}>
                Smart School ERP mobile app usage terms
              </Text>
            </View>

            <Pressable onPress={onClose} hitSlop={10} style={styles.closeButton}>
              <MaterialIcons name="close" size={20} color={COLORS.textPrimary} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>1. Account access</Text>
            <Text style={styles.body}>
              Only authorized teachers, parents, and students should use the mobile
              app.
            </Text>

            <Text style={styles.sectionTitle}>2. OTP verification</Text>
            <Text style={styles.body}>
              Phone verification is used to protect your account and confirm access.
            </Text>

            <Text style={styles.sectionTitle}>3. Data usage</Text>
            <Text style={styles.body}>
              The app displays school information, attendance, homework, marks,
              fees, and timetable data provided by the school.
            </Text>

            <Text style={styles.sectionTitle}>4. Security</Text>
            <Text style={styles.body}>
              Do not share your OTP or account credentials with anyone.
            </Text>

            <Text style={styles.sectionTitle}>5. Acceptance</Text>
            <Text style={styles.body}>
              By continuing to use the app, you agree to the school terms, privacy
              policy, and internal usage rules.
            </Text>
          </ScrollView>

          <Pressable onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(15, 23, 42, 0.36)",
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  handle: {
    alignSelf: "center",
    backgroundColor: "#CBD5E1",
    borderRadius: 999,
    height: 4,
    marginBottom: SPACING.md,
    width: 48,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 999,
    justifyContent: "center",
    height: 34,
    width: 34,
  },
  content: {
    gap: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.textPrimary,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: "700",
  },
  body: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 21,
  },
  button: {
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
  },
  buttonText: {
    ...TYPOGRAPHY.body,
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
