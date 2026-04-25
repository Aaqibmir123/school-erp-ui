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
import { SafeAreaView } from "react-native-safe-area-context";

import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import {
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";

import {
  useCheckUserMutation,
  useFirebaseLoginMutation,
} from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import { auth, firebaseConfig } from "../firebase/firebase";
import { useNetwork } from "../hooks/useNetwork";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "../theme";
import AppButton from "../theme/Button";
import AppInput from "../theme/Input";
import { showToast } from "../utils/toast";

const RESEND_TIME = 30;
const ALLOWED_MOBILE_ROLES = new Set(["TEACHER", "PARENT", "STUDENT"]);
const BLOCKED_MOBILE_ROLES = new Set(["SCHOOL_ADMIN", "SUPER_ADMIN"]);

const formatE164Phone = (digits: string) => `+91${digits}`;

const getFirebaseMessage = (error: any) => {
  const code = error?.code || "";

  if (code === "auth/invalid-phone-number") {
    return "Phone number format is invalid.";
  }

  if (code === "auth/invalid-verification-code") {
    return "Invalid OTP. Please check the SMS code.";
  }

  if (code === "auth/too-many-requests") {
    return "Too many attempts. Please wait and try again.";
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
  const [verificationId, setVerificationId] = useState<string | null>(null);

  const recaptchaVerifier = useRef<any>(null);

  const { login } = useAuth();
  const isConnected = useNetwork();
  const [checkUser] = useCheckUserMutation();
  const [firebaseLogin] = useFirebaseLoginMutation();

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const normalizedPhone = useMemo(() => phone.replace(/[^0-9]/g, ""), [phone]);
  const e164Phone = useMemo(
    () => formatE164Phone(normalizedPhone),
    [normalizedPhone],
  );

  const sendOtp = async () => {
    if (!isConnected) {
      showToast.error("No internet connection");
      return;
    }

    try {
      if (!recaptchaVerifier.current) {
        throw new Error("reCAPTCHA verifier is not ready.");
      }

      console.log("FIREBASE PROJECTID:", firebaseConfig.projectId);
      console.log("FIREBASE APPID:", firebaseConfig.appId);
      console.log("PHONE SENT:", e164Phone);

      const phoneProvider = new PhoneAuthProvider(auth);

      const nextVerificationId = await phoneProvider.verifyPhoneNumber(
        e164Phone,
        recaptchaVerifier.current,
      );

      console.log("CONFIRMATION RESULT EXISTS:", Boolean(nextVerificationId));
      console.log("CONFIRMATION RESULT:", nextVerificationId);

      if (!nextVerificationId) {
        throw new Error("Firebase did not return a verificationId.");
      }

      setVerificationId(nextVerificationId);
      setStep("otp");
      setTimer(RESEND_TIME);
      showToast.success("OTP request accepted by Firebase");
    } catch (error: any) {
      console.log("ERROR CODE:", error?.code);
      console.log("ERROR MSG:", error?.message);
      console.log("FULL ERROR:", JSON.stringify(error, null, 2));

      showToast.error(getFirebaseMessage(error));
    }
  };

  const checkMobileUserRole = async () => {
    const response = await checkUser(e164Phone).unwrap();
    const role = String(response?.role || "").toUpperCase();

    console.log("CHECK USER ROLE:", role);

    if (!role) {
      throw new Error("User not found");
    }

    if (BLOCKED_MOBILE_ROLES.has(role)) {
      throw new Error("User not found. Please login from web panel.");
    }

    if (!ALLOWED_MOBILE_ROLES.has(role)) {
      throw new Error("Login allowed only for teachers, parents, and students");
    }

    return role;
  };

  const handleSendOtp = async () => {
    if (normalizedPhone.length !== 10) {
      showToast.error("Enter a valid 10-digit number");
      return;
    }

    setLoading(true);

    try {
      await checkMobileUserRole();
      await sendOtp();
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.message ||
        "Unable to verify user before OTP";

      if (message.includes("User not found")) {
        showToast.error(message);
        return;
      }

      showToast.error(message);
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

    if (!verificationId) {
      showToast.error("OTP session expired. Send a new OTP.");
      return;
    }

    try {
      setLoading(true);

      console.log("VERIFYING OTP FOR:", e164Phone);

      if (!verificationId) {
        throw new Error("Verification session expired.");
      }

      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const result = await signInWithCredential(auth, credential);
      const idToken = await result.user.getIdToken();

      console.log("OTP VERIFY SUCCESS:", result);

      const response = await firebaseLogin({ idToken }).unwrap();

      await login({
        students: response.students || [],
        token: response.token,
        user: response.user,
      });
    } catch (error: any) {
      console.log("ERROR CODE:", error?.code);
      console.log("ERROR MSG:", error?.message);
      console.log("FULL ERROR:", JSON.stringify(error, null, 2));

      showToast.error(
        error?.data?.message || error?.message || "OTP verification failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#0F172A", "#1D4ED8", "#38BDF8"]}
        style={styles.screen}
      >
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={firebaseConfig}
          attemptInvisibleVerification
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            automaticallyAdjustKeyboardInsets
          >
            <View style={styles.shell}>
              <View style={styles.hero}>
                <Image
                  source={require("../../assets/images/splash-icon.png")}
                  contentFit="contain"
                  style={styles.logo}
                />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Secure mobile access</Text>
                </View>
                <Text style={styles.heroTitle}>Smart School ERP</Text>
                <Text style={styles.heroSubtitle}>
                  {step === "phone"
                    ? "Teachers, parents, and students sign in with phone"
                    : "Enter the 6-digit code from SMS"}
                </Text>
                <View style={styles.heroMetaRow}>
                  <View style={styles.metaPill}>
                    <Text style={styles.metaPillText}>OTP Login</Text>
                  </View>
                  <View style={styles.metaPill}>
                    <Text style={styles.metaPillText}>Teacher • Parent</Text>
                  </View>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  {step === "phone" ? "Login" : "Verify OTP"}
                </Text>
                <Text style={styles.cardSubtitle}>
                  {step === "phone"
                    ? "Enter your registered mobile number."
                    : "Check the code sent to your phone."}
                </Text>

                <View style={styles.form}>
                  {step === "phone" ? (
                    <AppInput
                      label="Phone Number"
                      keyboardType="phone-pad"
                      leftIcon="call-outline"
                      maxLength={10}
                      onChangeText={(value) => {
                        const sanitizedValue = value.replace(/[^0-9]/g, "");
                        setPhone(sanitizedValue);
                      }}
                      placeholder="10-digit number"
                      value={normalizedPhone}
                    />
                  ) : (
                    <View style={styles.phoneSummary}>
                      <Text style={styles.phoneSummaryLabel}>
                        OTP requested for
                      </Text>
                      <View style={styles.phoneSummaryRow}>
                        <Text style={styles.phoneSummaryValue}>
                          +91 {normalizedPhone.slice(0, 2)}****{normalizedPhone.slice(-2)}
                        </Text>
                        <Pressable
                          onPress={() => {
                            setStep("phone");
                            setOtp("");
                            setVerificationId(null);
                          }}
                        >
                          <Text style={styles.linkText}>Edit</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}

                  {step === "otp" ? (
                    <>
                      <AppInput
                        label="OTP"
                        keyboardType="number-pad"
                        leftIcon="shield-checkmark-outline"
                        maxLength={6}
                        onChangeText={(value) =>
                          setOtp(value.replace(/[^0-9]/g, ""))
                        }
                        placeholder="6-digit OTP"
                        value={otp}
                      />

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
  badge: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  badgeText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  glowBottom: {
    backgroundColor: "rgba(56,189,248,0.22)",
    borderRadius: 999,
    bottom: -60,
    height: 180,
    position: "absolute",
    right: -60,
    width: 180,
  },
  glowTop: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 999,
    height: 220,
    left: -90,
    opacity: 0.6,
    position: "absolute",
    top: -80,
    width: 220,
  },
  card: {
    ...SHADOWS.card,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  cardTitle: {
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
    textAlign: "left",
  },
  cardSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  form: {
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  phoneSummary: {
    backgroundColor: "rgba(29,78,216,0.08)",
    borderColor: "rgba(29,78,216,0.16)",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  phoneSummaryLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  phoneSummaryRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  phoneSummaryValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: "700",
  },
  hero: {
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  heroSubtitle: {
    ...TYPOGRAPHY.body,
    color: "rgba(248,250,252,0.88)",
    marginTop: SPACING.xs,
    textAlign: "center",
  },
  heroMetaRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  heroTitle: {
    ...TYPOGRAPHY.headline,
    color: COLORS.textInverse,
    marginTop: SPACING.sm,
    textAlign: "center",
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
    height: 92,
    width: 92,
  },
  safeArea: {
    backgroundColor: "#0F172A",
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingBottom: SPACING.xl * 1.5,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl * 1.1,
  },
  metaPill: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  metaPillText: {
    color: COLORS.textInverse,
    fontSize: 12,
    fontWeight: "700",
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
    paddingBottom: SPACING.xl,
  },
});
