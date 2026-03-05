import { supabase } from "@/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { Link, Stack } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
const upperCase = /[A-Z]/;
const lowerCase = /[a-z]/;
const number = /\d/;
const symbol = /[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]/;

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- VALIDATIONS ---------------- */

  const isEmailValid = email.length === 0 || emailRegex.test(email);
  const isPasswordMatch =
    confirmPassword.length === 0 || password === confirmPassword;

  /* ---------------- PASSWORD RULES ---------------- */

  const passwordRules = useMemo(
    () => ({
      length: password.length >= 8,
      upper: upperCase.test(password),
      lower: lowerCase.test(password),
      number: number.test(password),
      symbol: symbol.test(password),
    }),
    [password]
  );

  const passwordScore = Object.values(passwordRules).filter(Boolean).length;

  const passwordStrength =
    passwordScore <= 2 ? "Weak" : passwordScore <= 4 ? "Medium" : "Strong";

  const strengthColor =
    passwordStrength === "Weak"
      ? "bg-red-500"
      : passwordStrength === "Medium"
        ? "bg-yellow-500"
        : "bg-green-500";

  const isFormValid =
    emailRegex.test(email) &&
    passwordScore === 5 &&
    password === confirmPassword;

  async function signUpWithEmail() {
    if (!isFormValid) {
      setError("Please fix the errors above");
      return;
    }

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  return (
    <View style={{ flex: 1 }}>
      {/* 🔹 ABSOLUTE GRADIENT BACKGROUND */}
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
            <Stack.Screen options={{ title: "Sign up" }} />

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
                  onChangeText={setEmail}
                  placeholder="Email address"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor="#9CA3AF"
                  className={`border rounded-full px-5 py-3 bg-white ${
                    !isEmailValid ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {!isEmailValid && (
                  <Text className="text-red-500 text-xs mt-1 ml-2">
                    Enter a valid email address
                  </Text>
                )}
              </View>

              {/* PASSWORD */}
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
                placeholderTextColor="#9CA3AF"
                className="border border-gray-300 rounded-full px-5 py-3 bg-white"
              />

              {/* PASSWORD STRENGTH */}
              {password.length > 0 && (
                <View className="gap-2">
                  <View className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <View
                      className={`${strengthColor} h-full`}
                      style={{ width: `${(passwordScore / 5) * 100}%` }}
                    />
                  </View>
                  <Text className="text-xs text-gray-600">
                    Password strength:{" "}
                    <Text className="font-semibold">{passwordStrength}</Text>
                  </Text>
                </View>
              )}

              {/* PASSWORD CHECKLIST */}
              {password.length > 0 && (
                <View className="gap-1">
                  {[
                    ["At least 8 characters", passwordRules.length],
                    ["One uppercase letter", passwordRules.upper],
                    ["One lowercase letter", passwordRules.lower],
                    ["One number", passwordRules.number],
                    ["One symbol", passwordRules.symbol],
                  ].map(([label, valid], i) => (
                    <Text
                      key={i}
                      className={`text-xs ${
                        valid ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {valid ? "✓" : "○"} {label}
                    </Text>
                  ))}
                </View>
              )}

              {/* CONFIRM PASSWORD */}
              <View>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm password"
                  secureTextEntry
                  placeholderTextColor="#9CA3AF"
                  className={`border rounded-full px-5 py-3 bg-white ${
                    !isPasswordMatch ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {!isPasswordMatch && (
                  <Text className="text-red-500 text-xs mt-1 ml-2">
                    Passwords do not match
                  </Text>
                )}
              </View>

              {!!error && (
                <Text className="text-red-500 text-sm text-center">
                  {error}
                </Text>
              )}

              {/* SUBMIT */}
              <TouchableOpacity
                onPress={signUpWithEmail}
                disabled={loading}
                className={`rounded-full py-3 items-center ${
                  loading ? "bg-gray-300" : "bg-black"
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold text-base">
                    Create account
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* SIGN IN */}
            <Link href="/sign-in" className="mt-6 text-blue-600 font-medium">
              Already have an account?
            </Link>

            {/* FOOTER */}
            <Text className="text-center text-gray-500 text-xs mt-6 px-2">
              By signing up, you agree to our{" "}
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
