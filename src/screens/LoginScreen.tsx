import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { checkLoginEligibility, sendOtp, verifyOtp } from "../api/auth";
import { normalizeIndianPhone } from "../utils/phone";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../utils/toast";

import LoginForm from "./login/LoginForm";
import LoginHero from "./login/LoginHero";
import { screenStyles as styles } from "./login/styles/auth.styles";

const getAuthErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return "Something went wrong";
};

export default function LoginScreen() {
  const { login: saveSession } = useAuth();
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;

  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(
    Array.from({ length: 6 }, () => ""),
  );
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [timer, setTimer] = useState(0);

  const normalizedPhone = normalizeIndianPhone(phone);

  useEffect(() => {
    if (!timer) return;

    const interval = setInterval(() => {
      setTimer((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleChangePhone = (value: string) => {
    setPhone(value.replace(/\D/g, "").slice(-10));
  };

  const resetOtp = () => {
    setOtpDigits(Array.from({ length: 6 }, () => ""));
    setTimer(0);
    setSessionId(null);
  };

  const handleSendOtp = async () => {
    if (normalizedPhone.length !== 10) {
      showToast.warning("Enter valid mobile number");
      return;
    }

    try {
      setSendingOtp(true);

      await checkLoginEligibility(normalizedPhone);

      const result = await sendOtp(normalizedPhone);

      setSessionId(result.sessionId);
      setStep("otp");
      setOtpDigits(Array.from({ length: 6 }, () => ""));
      setTimer(result.resendAfterSeconds || 60);

      showToast.success("OTP sent");
    } catch (error) {
      showToast.error(getAuthErrorMessage(error));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!sessionId) {
      showToast.warning("Send OTP first");
      return;
    }

    const otp = otpDigits.join("");

    if (otp.length !== 6) {
      showToast.warning("Enter valid OTP");
      return;
    }

    try {
      setVerifyingOtp(true);

      const result = await verifyOtp(normalizedPhone, otp.trim(), sessionId);

      await saveSession({
        token: result.token,
        refreshToken: result.refreshToken,
        user: result.user,
        students: result.students,
      });

      showToast.success("Login successful");
    } catch (error) {
      showToast.error(getAuthErrorMessage(error));
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;

    await handleSendOtp();
  };

  const handleEditPhone = () => {
    setStep("phone");
    resetOtp();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundTop} />
      <View style={styles.backgroundCircleOne} />
      <View style={styles.backgroundCircleTwo} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollWrap}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="none"
        >
          <View style={[styles.card, isTablet && styles.cardTablet]}>
            <LoginHero
              isTablet={isTablet}
              mode={step}
            />

            <LoginForm
              sendingOtp={sendingOtp}
              verifyingOtp={verifyingOtp}
              normalizedPhone={normalizedPhone}
              otpDigits={otpDigits}
              step={step}
              timer={timer}
              onChangePhone={handleChangePhone}
              onChangeOtpDigits={setOtpDigits}
              onSendOtp={handleSendOtp}
              onVerifyOtp={handleVerifyOtp}
              onResendOtp={handleResendOtp}
              onEditPhone={handleEditPhone}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
