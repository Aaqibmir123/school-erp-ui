import { MaterialIcons } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "../../theme";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function PrivacyPolicyModal({ visible, onClose }: Props) {
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
              <Text style={styles.title}>Privacy Policy</Text>
              <Text style={styles.subtitle}>
                Smart School ERP mobile app privacy notice
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
            <Text style={styles.sectionTitle}>1. Information we use</Text>
            <Text style={styles.body}>
              We may use your phone number, role, class, attendance, homework,
              marks, fee, timetable, and profile details to provide school
              services inside the app.
            </Text>

            <Text style={styles.sectionTitle}>2. Why we use it</Text>
            <Text style={styles.body}>
              The data is used to authenticate users, show school records, and
              keep the app secure for teachers, parents, and students.
            </Text>

            <Text style={styles.sectionTitle}>3. Data sharing</Text>
            <Text style={styles.body}>
              We do not sell personal data. Information is shared only with the
              school management system and authorized school users as required for
              app functionality.
            </Text>

            <Text style={styles.sectionTitle}>4. Security</Text>
            <Text style={styles.body}>
              OTP login, access controls, and backend validation are used to
              protect the app and reduce unauthorized access.
            </Text>

            <Text style={styles.sectionTitle}>5. Retention</Text>
            <Text style={styles.body}>
              School data is kept only as long as needed for school operations or
              legal requirements.
            </Text>

            <Text style={styles.sectionTitle}>6. Contact</Text>
            <Text style={styles.body}>
              For privacy questions, contact the school or app developer using the
              support email listed in the Play Store.
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
