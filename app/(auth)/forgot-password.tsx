import { supabase } from "@/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { Link, Stack } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

/* ---------------- REGEX ---------------- */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [emailTouched, setEmailTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const isEmailValid = emailRegex.test(email);

  const showEmailError = (emailTouched || submitAttempted) && !isEmailValid;

  const isFormValid = isEmailValid;

  async function handleForgotPassword() {
    setSubmitAttempted(true);

    if (!isFormValid) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "kamadhenu://reset-password",
      });

      if (error) throw error;

      setSuccess(true);
      setEmail("");
      setEmailTouched(false);
      setSubmitAttempted(false);
    } catch (err: unknown) {
      const message =
        (err as Error)?.message ?? String(err ?? "Failed to send reset email");
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      {/* 🔹 ABSOLUTE BACKGROUND */}
      <LinearGradient
        colors={["#1bcf5aff", "#ffffff", "#f9fafb"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: "absolute",
          inset: 0,
        }}
      />

      {/* 🔹 CONTENT */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-1 justify-center items-center px-8">
            <Stack.Screen options={{ title: "Forgot Password" }} />

            {/* HERO IMAGE */}
            <Image
              source={require("../../assets/images/auth-milk-image.png")}
              style={{ width: 260, height: 260 }}
              resizeMode="contain"
            />

            {/* HEADING */}
            <Text className="text-2xl font-bold text-center text-gray-800 mt-4">
              Reset Your Password
            </Text>
            <Text className="text-center text-gray-600 text-sm mt-2 px-2">
              Enter your email address and we'll send you a link to reset your
              password
            </Text>

            {/* FORM */}
            <View className="w-full gap-4 mt-8">
              {/* EMAIL */}
              <View>
                <TextInput
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (!emailTouched) setEmailTouched(true);
                  }}
                  placeholder="Email address"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor="#9CA3AF"
                  editable={!loading && !success}
                  className={`border rounded-full px-5 py-3 bg-white ${
                    showEmailError ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {showEmailError && (
                  <Text className="text-red-500 text-xs mt-1 ml-2">
                    Enter a valid email address
                  </Text>
                )}
              </View>

              {!!error && (
                <Text className="text-red-500 text-sm text-center">
                  {error}
                </Text>
              )}

              {success && (
                <View className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <Text className="text-green-800 text-sm font-medium">
                    ✓ Reset link sent!
                  </Text>
                  <Text className="text-green-700 text-xs mt-1">
                    Check your email for password reset instructions.
                  </Text>
                </View>
              )}

              {/* RESET BUTTON */}
              <TouchableOpacity
                onPress={handleForgotPassword}
                disabled={loading || success}
                className={`rounded-full py-3 items-center ${
                  loading || success ? "bg-gray-300" : "bg-black"
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold text-base">
                    Send Reset Link
                  </Text>
                )}
              </TouchableOpacity>

              {success && (
                <TouchableOpacity
                  onPress={() => {
                    setSuccess(false);
                    setError("");
                  }}
                  className="rounded-full py-3 items-center border border-black"
                >
                  <Text className="text-black font-semibold text-base">
                    Send Another Link
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* BACK TO SIGN IN */}
            <Link href="/sign-in" className="mt-6 text-blue-600 font-medium">
              Back to Sign in
            </Link>

            {/* FOOTER */}
            <Text className="text-center text-gray-500 text-xs mt-6 px-2">
              By continuing, you agree to our{" "}
              <Text className="text-blue-500">Terms</Text>,{" "}
              <Text className="text-blue-500">Privacy Policy</Text> and{" "}
              <Text className="text-blue-500">Cookie Use</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
