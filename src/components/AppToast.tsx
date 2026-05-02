import { Ionicons } from "@expo/vector-icons";
import {
  BaseToast,
  ErrorToast,
  ToastConfig,
} from "react-native-toast-message";

import { COLORS, RADIUS, SHADOWS, SPACING } from "@/src/theme";

const TOAST_STYLES = {
  success: {
    borderLeftColor: COLORS.success,
    backgroundColor: COLORS.successSoft,
    icon: "checkmark-circle-outline" as const,
    tint: COLORS.success,
  },
  error: {
    borderLeftColor: COLORS.danger,
    backgroundColor: COLORS.dangerSoft,
    icon: "close-circle-outline" as const,
    tint: COLORS.danger,
  },
  info: {
    borderLeftColor: COLORS.info,
    backgroundColor: COLORS.infoSoft,
    icon: "information-circle-outline" as const,
    tint: COLORS.info,
  },
  warning: {
    borderLeftColor: COLORS.warning,
    backgroundColor: COLORS.warningSoft,
    icon: "warning-outline" as const,
    tint: COLORS.warning,
  },
};

const leadingIcon = (name: keyof typeof Ionicons.glyphMap, color: string) => (
  <Ionicons name={name} size={22} color={color} />
);

const baseToastStyle = (accent: string, backgroundColor: string) => [
  SHADOWS.soft,
  {
    backgroundColor,
    borderColor: `${accent}22`,
    borderLeftColor: accent,
    borderLeftWidth: 5,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    overflow: "hidden" as const,
  },
];

const baseText1 = {
  color: COLORS.textPrimary,
  fontSize: 14,
  fontWeight: "800" as const,
};

const baseText2 = {
  color: COLORS.textSecondary,
  fontSize: 12,
  lineHeight: 16,
};

export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={baseToastStyle(
        TOAST_STYLES.success.borderLeftColor,
        TOAST_STYLES.success.backgroundColor,
      )}
      contentContainerStyle={{ paddingHorizontal: SPACING.md }}
      text1Style={baseText1}
      text2Style={baseText2}
      text1NumberOfLines={1}
      text2NumberOfLines={2}
      renderLeadingIcon={() =>
        leadingIcon(TOAST_STYLES.success.icon, TOAST_STYLES.success.tint)
      }
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={baseToastStyle(
        TOAST_STYLES.error.borderLeftColor,
        TOAST_STYLES.error.backgroundColor,
      )}
      contentContainerStyle={{ paddingHorizontal: SPACING.md }}
      text1Style={baseText1}
      text2Style={baseText2}
      text1NumberOfLines={1}
      text2NumberOfLines={2}
      renderLeadingIcon={() =>
        leadingIcon(TOAST_STYLES.error.icon, TOAST_STYLES.error.tint)
      }
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={baseToastStyle(
        TOAST_STYLES.info.borderLeftColor,
        TOAST_STYLES.info.backgroundColor,
      )}
      contentContainerStyle={{ paddingHorizontal: SPACING.md }}
      text1Style={baseText1}
      text2Style={baseText2}
      text1NumberOfLines={1}
      text2NumberOfLines={2}
      renderLeadingIcon={() =>
        leadingIcon(TOAST_STYLES.info.icon, TOAST_STYLES.info.tint)
      }
    />
  ),
  warning: (props) => (
    <BaseToast
      {...props}
      style={baseToastStyle(
        TOAST_STYLES.warning.borderLeftColor,
        TOAST_STYLES.warning.backgroundColor,
      )}
      contentContainerStyle={{ paddingHorizontal: SPACING.md }}
      text1Style={baseText1}
      text2Style={baseText2}
      text1NumberOfLines={1}
      text2NumberOfLines={2}
      renderLeadingIcon={() =>
        leadingIcon(TOAST_STYLES.warning.icon, TOAST_STYLES.warning.tint)
      }
    />
  ),
};
