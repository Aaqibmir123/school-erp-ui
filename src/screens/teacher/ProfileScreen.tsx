import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  useGetTeacherProfileQuery,
  useUpdateTeacherProfileMutation,
} from "@/src/api/teacher/teacherApi";
import BrandLoader from "@/src/components/BrandLoader";
import { APP_ENV } from "@/src/config/env";
import { useAuth } from "@/src/context/AuthContext";
import AppButton from "@/src/theme/Button";
import { COLORS } from "@/src/theme";
import { showToast } from "@/src/utils/toast";

import styles from "./ProfileScreen.styles";

const resolveImageUri = (value?: string | null) => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `${APP_ENV.SERVER_URL}${value.startsWith("/") ? "" : "/"}${value}`;
};

const splitName = (value?: string | null) => {
  const parts = (value || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
};

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { updateUser, user } = useAuth();
  const { data: profile, isLoading, refetch } = useGetTeacherProfileQuery();
  const [updateProfile, { isLoading: saving }] =
    useUpdateTeacherProfileMutation();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    qualification: "",
    address: "",
  });

  useEffect(() => {
    if (!profile) return;

    const fallbackName = splitName(user?.name);

    setForm({
      firstName: profile.firstName || fallbackName.firstName || "",
      lastName: profile.lastName || fallbackName.lastName || "",
      email: profile.email || user?.email || "",
      phone: profile.phone || user?.phone || "",
      gender: profile.gender || "",
      qualification: profile.qualification || "",
      address: profile.address || "",
    });
  }, [profile, user?.email, user?.name, user?.phone]);

  const displayName = useMemo(() => {
    const name = `${form.firstName} ${form.lastName}`.trim();
    return name || "Teacher";
  }, [form.firstName, form.lastName]);

  const avatarInitial = useMemo(() => {
    return (
      form.firstName?.charAt(0)?.toUpperCase() ||
      form.lastName?.charAt(0)?.toUpperCase() ||
      user?.name?.charAt(0)?.toUpperCase() ||
      "T"
    );
  }, [form.firstName, form.lastName, user?.name]);

  const handleSave = async () => {
    try {
      const fallbackName = splitName(user?.name);
      const resolvedFirstName =
        form.firstName.trim() || profile?.firstName || fallbackName.firstName;
      const resolvedLastName =
        form.lastName.trim() || profile?.lastName || fallbackName.lastName;

      if (!resolvedFirstName || !resolvedLastName) {
        showToast.warning("Teacher name is required");
        return;
      }

      const payload = new FormData();
      payload.append("firstName", resolvedFirstName);
      payload.append("lastName", resolvedLastName);

      const appendIfFilled = (key: string, value: string) => {
        const trimmed = value.trim();
        if (trimmed) payload.append(key, trimmed);
      };

      appendIfFilled("email", form.email);
      appendIfFilled("phone", form.phone);
      appendIfFilled("gender", form.gender);
      appendIfFilled("qualification", form.qualification);
      appendIfFilled("address", form.address);

      const response = await updateProfile(payload).unwrap();
      const updated = response || {};

      await updateUser({
        name:
          [
            updated?.firstName || resolvedFirstName,
            updated?.lastName || resolvedLastName,
          ]
            .filter(Boolean)
            .join(" ")
            .trim() || displayName,
        email: updated?.email || form.email || user?.email || undefined,
        phone: updated?.phone || form.phone || user?.phone || undefined,
      });

      await refetch();
      showToast.success("Profile updated");
    } catch (error: any) {
      showToast.error(error?.data?.message || "Failed to update profile");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
        <View style={styles.center}>
          <BrandLoader />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { paddingBottom: Math.max(insets.bottom, 16) + 20 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={["#0F172A", "#1D4ED8", "#38BDF8"]}
            style={styles.heroCard}
          >
            <View style={styles.heroBody}>
              <View style={styles.avatarWrap}>
                {profile?.profileImage ? (
                  <Image
                    source={{ uri: resolveImageUri(profile.profileImage) || "" }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarFallbackText}>{avatarInitial}</Text>
                  </View>
                )}
              </View>

              <View style={styles.heroTextWrap}>
                <Text style={styles.titleLight}>{displayName}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.metaChip}>
                    <Ionicons name="call-outline" size={13} color="#DBEAFE" />
                    <Text style={styles.metaText}>
                      {form.phone.trim() || "Phone not set"}
                    </Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Ionicons name="mail-outline" size={13} color="#DBEAFE" />
                    <Text style={styles.metaText}>
                      {form.email.trim() || "Email not set"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.card}>
            <SectionHeader
              icon="person-outline"
              title="Personal details"
            />

            <View style={styles.dualRow}>
              <Input
                icon="person-outline"
                placeholder="First name"
                value={form.firstName}
                onChangeText={(value) =>
                  setForm((prev) => ({ ...prev, firstName: value }))
                }
              />
              <Input
                icon="person-outline"
                placeholder="Last name"
                value={form.lastName}
                onChangeText={(value) =>
                  setForm((prev) => ({ ...prev, lastName: value }))
                }
              />
            </View>

            <Input
              icon="call-outline"
              placeholder="Phone number"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(value) =>
                setForm((prev) => ({ ...prev, phone: value }))
              }
            />

            <Input
              icon="mail-outline"
              placeholder="Email address"
              autoCapitalize="none"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(value) =>
                setForm((prev) => ({ ...prev, email: value }))
              }
            />

            <Input
              icon="transgender-outline"
              placeholder="Gender"
              value={form.gender}
              onChangeText={(value) =>
                setForm((prev) => ({ ...prev, gender: value }))
              }
            />
          </View>

          <View style={styles.card}>
            <SectionHeader
              icon="school-outline"
              title="Professional details"
            />

            <Input
              icon="ribbon-outline"
              placeholder="Qualification"
              value={form.qualification}
              onChangeText={(value) =>
                setForm((prev) => ({ ...prev, qualification: value }))
              }
            />

            <Input
              icon="location-outline"
              placeholder="Address"
              value={form.address}
              onChangeText={(value) =>
                setForm((prev) => ({ ...prev, address: value }))
              }
              multiline
              style={styles.textArea}
            />
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <AppButton title="Save Profile" onPress={handleSave} loading={saving} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const SectionHeader = ({
  title,
  icon,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionIcon}>
      <Ionicons name={icon} size={16} color={COLORS.primary} />
    </View>
    <View style={styles.sectionTextWrap}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  </View>
);

const Input = ({
  icon,
  style,
  ...props
}: TextInputProps & { icon: keyof typeof Ionicons.glyphMap }) => (
  <View style={styles.inputShell}>
    <View style={styles.inputIcon}>
      <Ionicons name={icon} size={16} color={COLORS.primary} />
    </View>
    <TextInput
      placeholderTextColor={COLORS.textTertiary}
      style={[styles.input, style]}
      {...props}
    />
  </View>
);

export default ProfileScreen;
