import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { signInWithPhoneNumber } from "firebase/auth";

import { useFirebaseLoginMutation } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import { auth, firebaseConfig } from "../firebase/firebase";
import { useNetwork } from "../hooks/useNetwork";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "../theme";
import AppButton from "../theme/Button";
import AppInput from "../theme/Input";
import { showToast } from "../utils/toast";

const RESEND_TIME = 30;

const getFirebaseMessage = (error: any) => {
  const code = error?.code || "";

  if (code === "auth/invalid-phone-number") {
    return "Phone number format is invalid.";
  }

  if (
    code === "auth/network-request-failed" ||
    code === "auth/quota-exceeded"
  ) {
    return "OTP request failed. Check internet or Firebase quota.";
  }

  if (
    code === "auth/app-not-authorized" ||
    code === "auth/invalid-app-credential" ||
    code === "auth/captcha-check-failed"
  ) {
    return "Firebase phone auth is not ready on this build yet.";
  }

  return error?.message || "Unable to send OTP";
};

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const insets = useSafeAreaInsets();

  const recaptchaVerifier = useRef<any>(null);
  const confirmationRef = useRef<any>(null);

  const { login } = useAuth();
  const isConnected = useNetwork();
  const [firebaseLogin] = useFirebaseLoginMutation();

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const normalizedPhone = useMemo(() => phone.replace(/[^0-9]/g, ""), [phone]);

  const sendOtp = async () => {
    if (!isConnected) {
      showToast.error("No internet connection");
      return;
    }

    try {
      const confirmation = await signInWithPhoneNumber(
        auth,
        `+91${normalizedPhone}`,
        recaptchaVerifier.current,
      );

      confirmationRef.current = confirmation;
      setStep("otp");
      setTimer(RESEND_TIME);
      showToast.success("OTP sent");
    } catch (error: any) {
      showToast.error(getFirebaseMessage(error));
    }
  };

  const handleSendOtp = async () => {
    if (normalizedPhone.length !== 10) {
      showToast.error("Enter a valid 10-digit number");
      return;
    }

    setLoading(true);

    try {
      // WHY: Backend login already auto-resolves parent accounts after Firebase
      // verification, so blocking OTP behind `checkUser` was stopping valid
      // Firebase numbers from even reaching the verification step.
      await sendOtp();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) {
      return;
    }

    setLoading(true);

    try {
      await sendOtp();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      showToast.error("Enter the 6-digit OTP");
      return;
    }

    if (!confirmationRef.current) {
      showToast.error("OTP session expired. Send a new OTP.");
      return;
    }

    try {
      setLoading(true);

      const result = await confirmationRef.current.confirm(otp);
      const idToken = await result.user.getIdToken();
      const response = await firebaseLogin({ idToken }).unwrap();

      await login({
        students: response.students || [],
        token: response.token,
        user: response.user,
      });
    } catch (error: any) {
      showToast.error(
        error?.data?.message || error?.message || "OTP verification failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <LinearGradient
        colors={["#0F172A", "#1D4ED8", "#38BDF8"]}
        style={styles.gradient}
      >
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={firebaseConfig}
          attemptInvisibleVerification
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={insets.top}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, SPACING.lg) + 24 },
            ]}
            contentInsetAdjustmentBehavior="always"
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.shell}>
              <View style={styles.hero}>
                <Image
                  source={require("../../assets/images/splash-icon.png")}
                  contentFit="contain"
                  style={styles.logo}
                />
                <Text style={styles.heroTitle}>School ERP</Text>
                <Text style={styles.heroSubtitle}>
                  {step === "phone"
                    ? "Login with your registered phone number"
                    : `Enter the 6-digit code sent to +91 ${normalizedPhone}`}
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  {step === "phone" ? "Login" : "Verify OTP"}
                </Text>

                <View style={styles.form}>
                  <AppInput
                    compact
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="phone-pad"
                    label="Phone Number"
                    leftIcon="call-outline"
                    maxLength={10}
                    onChangeText={(value) => {
                      const sanitizedValue = value.replace(/[^0-9]/g, "");
                      setPhone(sanitizedValue);

                      if (step === "otp") {
                        setOtp("");
                        setStep("phone");
                        confirmationRef.current = null;
                      }
                    }}
                    onSubmitEditing={handleSendOtp}
                    placeholder="10-digit mobile number"
                    returnKeyType="done"
                    textContentType="telephoneNumber"
                    value={normalizedPhone}
                  />

                  {step === "otp" ? (
                    <>
                      <AppInput
                        compact
                        autoCorrect={false}
                        keyboardType="number-pad"
                        label="OTP"
                        leftIcon="shield-checkmark-outline"
                        maxLength={6}
                        onChangeText={(value) =>
                          setOtp(value.replace(/[^0-9]/g, ""))
                        }
                        onSubmitEditing={handleVerifyOtp}
                        placeholder="6-digit OTP"
                        returnKeyType="done"
                        textContentType="oneTimeCode"
                        value={otp}
                      />

                      <View style={styles.inlineRow}>
                        <Text style={styles.helperText}>
                          +91 {normalizedPhone}
                        </Text>
                        <Pressable
                          onPress={() => {
                            setStep("phone");
                            setOtp("");
                          }}
                        >
                          <Text style={styles.linkText}>Edit</Text>
                        </Pressable>
                      </View>

                      <AppButton
                        title="Verify"
                        onPress={handleVerifyOtp}
                        loading={loading}
                        disabled={!isConnected}
                      />

                      <Pressable
                        disabled={!isConnected || timer > 0}
                        onPress={handleResendOtp}
                        style={({ pressed }) => [
                          styles.secondaryAction,
                          pressed && timer <= 0 && styles.secondaryPressed,
                        ]}
                      >
                        <Text style={styles.secondaryText}>
                          {!isConnected
                            ? "Offline"
                            : timer > 0
                              ? `Resend in ${timer}s`
                              : "Resend OTP"}
                        </Text>
                      </Pressable>
                    </>
                  ) : (
                    <AppButton
                      title="Send OTP"
                      onPress={handleSendOtp}
                      loading={loading}
                      disabled={normalizedPhone.length !== 10 || !isConnected}
                    />
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    ...SHADOWS.card,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  cardTitle: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  form: {
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  helperText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  hero: {
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  heroSubtitle: {
    ...TYPOGRAPHY.body,
    color: "rgba(248,250,252,0.88)",
    marginTop: SPACING.xs,
    textAlign: "center",
  },
  heroTitle: {
    ...TYPOGRAPHY.title,
    color: COLORS.textInverse,
    marginTop: SPACING.sm,
  },
  inlineRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  keyboardView: {
    flex: 1,
  },
  linkText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: "700",
  },
  logo: {
    height: 88,
    width: 88,
  },
  screen: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  secondaryAction: {
    alignItems: "center",
    marginTop: SPACING.xs,
    paddingVertical: SPACING.sm,
  },
  secondaryPressed: {
    opacity: 0.7,
  },
  secondaryText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  shell: {
    alignSelf: "center",
    maxWidth: 420,
    width: "100%",
  },
});
