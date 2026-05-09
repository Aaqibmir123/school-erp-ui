import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Text, View } from "react-native";

import { heroStyles as styles } from "./styles/auth.styles";

type Props = {
  isTablet?: boolean;
  mode: "phone" | "otp";
};

function LoginHero({ isTablet = false, mode }: Props) {
  if (mode === "phone") {
    return (
      <View style={[styles.wrapper, isTablet && styles.wrapperTablet]}>
        <View style={styles.logoBadge}>
          <View style={styles.logoCircle}>
            <Ionicons name="school" size={38} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.heroTag}>
          <Ionicons name="shield-checkmark" size={14} color="#1D4ED8" />
          <Text style={styles.heroTagText}>Secure OTP sign in</Text>
        </View>

        <Text style={styles.brand}>SMART SCHOOL ERP</Text>

        <Text style={styles.title}>Welcome Back</Text>

        <View style={styles.iconRow}>
          <View style={styles.featureIcon}>
            <Ionicons name="book-outline" size={24} color="#1D4ED8" />
          </View>

          <View style={styles.featureIconCenter}>
            <Ionicons name="library-outline" size={28} color="#FFFFFF" />
          </View>

          <View style={styles.featureIcon}>
            <Ionicons name="document-text-outline" size={24} color="#1D4ED8" />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, styles.otpHeaderWrap]}>
      <View style={styles.verifyTopIcon}>
        <Ionicons name="shield-checkmark" size={26} color="#1D4ED8" />
      </View>

      <Text style={styles.otpTitle}>Verify the code</Text>

    </View>
  );
}

export default memo(LoginHero);
