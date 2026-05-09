import { memo, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { APP_ENV } from "../../config/env";
import { formStyles as styles } from "./styles/auth.styles";

type Props = {
  sendingOtp: boolean;
  verifyingOtp: boolean;
  normalizedPhone: string;
  otpDigits: string[];
  step: "phone" | "otp";
  timer: number;
  onChangePhone: (value: string) => void;
  onChangeOtpDigits: (value: string[]) => void;
  onSendOtp: () => void;
  onVerifyOtp: () => void;
  onResendOtp: () => void;
  onEditPhone: () => void;
};

const OTP_LENGTH = 6;

const formatTime = (seconds: number) => {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remaining = String(seconds % 60).padStart(2, "0");

  return `${minutes}:${remaining}`;
};

const sanitizeDigits = (value: string) => value.replace(/\D/g, "");

function LoginForm({
  sendingOtp,
  verifyingOtp,
  normalizedPhone,
  otpDigits,
  step,
  timer,
  onChangePhone,
  onChangeOtpDigits,
  onSendOtp,
  onVerifyOtp,
  onResendOtp,
  onEditPhone,
}: Props) {
  const phoneRef = useRef<TextInput>(null);
  const otpRefs = useRef<Array<TextInput | null>>([]);

  const isPhoneStep = step === "phone";
  const canSend = normalizedPhone.length === 10 && !sendingOtp;
  const canVerify = otpDigits.every(Boolean) && !verifyingOtp;

  useEffect(() => {
    const focusDelay = setTimeout(() => {
      if (isPhoneStep) {
        phoneRef.current?.focus();
        return;
      }

      const currentDigits = otpDigits;
      const firstEmpty = Math.min(
        currentDigits.findIndex((digit) => !digit),
        OTP_LENGTH - 1,
      );
      otpRefs.current[firstEmpty >= 0 ? firstEmpty : 0]?.focus();
    }, 80);

    return () => clearTimeout(focusDelay);
  }, [isPhoneStep, otpDigits]);

  const updateOtpValue = (index: number, nextValue: string) => {
    const digits = sanitizeDigits(nextValue);
    const current = otpDigits.slice();

    if (!digits) {
      current[index] = "";
      onChangeOtpDigits(current);
      return;
    }

    if (digits.length > 1) {
      digits.split("").forEach((digit, offset) => {
        const targetIndex = index + offset;
        if (targetIndex < OTP_LENGTH) {
          current[targetIndex] = digit;
        }
      });

      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      onChangeOtpDigits(current);
      otpRefs.current[nextIndex]?.focus();
      return;
    }

    current[index] = digits[0];
    onChangeOtpDigits(current);

    if (index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (index: number, key: string) => {
    if (key !== "Backspace") return;

    if (otpDigits[index]) {
      const current = otpDigits.slice();
      current[index] = "";
      onChangeOtpDigits(current);
      return;
    }

    if (index > 0) {
      otpRefs.current[index - 1]?.focus();
      const current = otpDigits.slice();
      current[index - 1] = "";
      onChangeOtpDigits(current);
    }
  };

  return (
    <View style={styles.formWrap}>
      {isPhoneStep ? (
        <>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Mobile Number</Text>

            <View style={styles.inputWrap}>
              <View style={styles.countryChip}>
                <Text style={styles.countryFlag}>🇮🇳</Text>
                <Text style={styles.countryText}>{APP_ENV.PHONE_COUNTRY_CODE}</Text>
              </View>

              <TextInput
                ref={phoneRef}
                value={normalizedPhone}
                onChangeText={onChangePhone}
                keyboardType="number-pad"
                maxLength={10}
                placeholder="Enter mobile number"
                placeholderTextColor="#94A3B8"
                returnKeyType="done"
                textContentType="telephoneNumber"
                autoComplete="tel"
                onSubmitEditing={onSendOtp}
                style={styles.phoneInput}
                editable={!sendingOtp}
              />
            </View>
          </View>

          <Pressable
            disabled={!canSend}
            onPress={onSendOtp}
            style={({ pressed }) => [
              styles.button,
              !canSend && styles.buttonDisabled,
              pressed && canSend && styles.buttonPressed,
            ]}
          >
            {sendingOtp ? (
              <View style={styles.buttonLoading}>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.buttonText}>Sending OTP</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Send OTP</Text>
            )}
          </Pressable>
        </>
      ) : (
        <>
          <View style={styles.fieldGroup}>
            <View style={styles.otpHeaderRow}>
              <Text style={styles.label}>Enter OTP</Text>

              <Pressable onPress={onEditPhone} hitSlop={10}>
                <Text style={styles.inlineLink}>Change number</Text>
              </Pressable>
            </View>

            <View style={styles.otpGrid}>
              {otpDigits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    otpRefs.current[index] = ref;
                  }}
                  value={digit}
                  onChangeText={(value) => updateOtpValue(index, value)}
                  onKeyPress={({ nativeEvent }) =>
                    handleOtpKeyPress(index, nativeEvent.key)
                  }
                  keyboardType="number-pad"
                  maxLength={OTP_LENGTH}
                  style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                  placeholder="0"
                  placeholderTextColor="#CBD5E1"
                  textAlign="center"
                  returnKeyType="done"
                  autoCapitalize="none"
                  autoCorrect={false}
                  selectTextOnFocus
                  importantForAutofill="yes"
                  autoComplete="one-time-code"
                  textContentType={index === 0 ? "oneTimeCode" : "none"}
                  caretHidden={false}
                  editable={!verifyingOtp}
                  contextMenuHidden={false}
                />
              ))}
            </View>
          </View>

          <Pressable
            disabled={!canVerify}
            onPress={onVerifyOtp}
            style={({ pressed }) => [
              styles.button,
              !canVerify && styles.buttonDisabled,
              pressed && canVerify && styles.buttonPressed,
            ]}
          >
            {verifyingOtp ? (
              <View style={styles.buttonLoading}>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.buttonText}>Verifying</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Verify & Continue</Text>
            )}
          </Pressable>

          <View style={styles.secondaryActions}>
            <Pressable disabled={timer > 0 || sendingOtp} onPress={onResendOtp}>
              <Text style={[styles.linkText, timer > 0 && styles.linkTextDisabled]}>
                {timer > 0 ? `Resend in ${formatTime(timer)}` : "Resend OTP"}
              </Text>
            </Pressable>

            <Pressable onPress={onEditPhone}>
              <Text style={styles.changeText}>Use a different number</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

export default memo(LoginForm);
