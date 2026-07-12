import { supabase, directAuth, fetchProfileDirect } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, Stack } from "expo-router";
import NetInfo from "@react-native-community/netinfo";
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

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isEmailValid = emailRegex.test(email);
  const isPasswordValid = password.length > 0;

  const showEmailError = (emailTouched || submitAttempted) && !isEmailValid;
  const showPasswordError =
    (passwordTouched || submitAttempted) && !isPasswordValid;

  const isFormValid = isEmailValid && isPasswordValid;

  async function signInWithEmail() {
    setSubmitAttempted(true);

    if (!isFormValid) {
      setError("Please fix the errors above");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // 0️⃣ Check network connectivity first
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        setError(
          "No internet connection. Please check your WiFi or mobile data.",
        );
        setLoading(false);
        return;
      }

      console.log(
        "Network type:",
        netState.type,
        "Connected:",
        netState.isConnected,
      );

      // Use direct auth instead of Supabase client (bypasses client issues on mobile)
      const authData = await directAuth(email, password, 5);
      console.log("✅ Auth successful, now checking profile...");

      // Store session token
      await AsyncStorage.setItem("auth_token", authData.access_token);

      // Fetch profile with retry
      const profile = await fetchProfileDirect(
        authData.user.id,
        authData.access_token,
        3,
      );

      // Check if user is active
      if (!profile.is_active) {
        setError("You are inactive. Contact admin.");
        setLoading(false);
        return;
      }

      // Update Supabase session for future use
      await supabase.auth.setSession({
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
      });

      console.log("✅ Sign-in successful!");
      setLoading(false);
    } catch (err: unknown) {
      const message =
        (err as Error)?.message ?? String(err ?? "Sign in failed");
      console.error("🔴 Final error:", message);
      setError(message);
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
            <Stack.Screen options={{ title: "Sign in" }} />

            {/* HERO IMAGE */}
            <Image
              source={require("../../assets/images/auth-milk-image.png")}
              style={{ width: 260, height: 260 }}
              resizeMode="contain"
            />

            {/* FORM */}
            <View className="w-full gap-4 mt-6">
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

              {/* PASSWORD */}
              <View>
                <View
                  className={`flex-row items-center border rounded-full px-5 py-1 bg-white ${
                    showPasswordError ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <TextInput
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (!passwordTouched) setPasswordTouched(true);
                    }}
                    placeholder="Password"
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 py-3 text-black"
                  />

                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>

                {showPasswordError && (
                  <Text className="text-red-500 text-xs mt-1 ml-2">
                    Password is required
                  </Text>
                )}
              </View>

              {!!error && (
                <Text className="text-red-500 text-sm text-center">
                  {error}
                </Text>
              )}

              {/* SIGN IN BUTTON */}
              <TouchableOpacity
                onPress={signInWithEmail}
                disabled={loading}
                className={`rounded-full py-3 items-center ${
                  loading ? "bg-gray-300" : "bg-black"
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold text-base">
                    Sign in
                  </Text>
                )}
              </TouchableOpacity>

              <View className="flex-row justify-between mt-2">
                {/* FORGOT PASSWORD */}
                <Link
                  href="/forgot-password"
                  className="text-blue-600 font-medium "
                >
                  Forgot password?
                </Link>

                {/* SIGN UP */}
                <Link href="/sign-up" className="text-blue-600 font-medium">
                  Create an account
                </Link>
              </View>
            </View>

            {/* FOOTER */}
            <Text className="text-center text-gray-500 text-xs mt-6 px-2">
              By signing in, you agree to our{" "}
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
