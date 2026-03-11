import { supabase } from "@/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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

const upperCase = /[A-Z]/;
const lowerCase = /[a-z]/;
const number = /\d/;
const symbol = /[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]/;

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(false);

  const [submitAttempted, setSubmitAttempted] = useState(false);
  const router = useRouter();
  const { token, type } = useLocalSearchParams();

  /* ✅ Verify reset token on mount */
  useEffect(() => {
    const verifyToken = async () => {
      if (!token || type !== "recovery") {
        setError("Invalid or expired reset link. Please request a new one.");
        return;
      }

      try {
        // Exchange the token for a session using token hash
        const { error: sessionError } = await supabase.auth.verifyOtp({
          token_hash: String(token),
          type: "recovery",
        });

        if (sessionError) {
          setError("Reset link has expired. Please request a new one.");
          console.error("Token verification error:", sessionError);
          return;
        }

        setValidToken(true);
      } catch (err) {
        setError("Failed to verify reset link");
        console.error(err);
      }
    };

    verifyToken();
  }, [token, type]);

  /* ---------------- PASSWORD RULES ---------------- */

  const passwordRules = useMemo(
    () => ({
      length: password.length >= 8,
      upper: upperCase.test(password),
      lower: lowerCase.test(password),
      number: number.test(password),
      symbol: symbol.test(password),
    }),
    [password],
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

  const isPasswordMatch =
    confirmPassword.length === 0 || password === confirmPassword;

  const isFormValid =
    passwordScore === 5 && password === confirmPassword && password.length > 0;

  async function handleResetPassword() {
    setSubmitAttempted(true);

    if (!isFormValid) {
      setError("Please fix the errors above");
      return;
    }

    if (!validToken) {
      setError("Invalid session. Please request a new reset link.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // ✅ Now updateUser works because we have a valid session from verifyOtp
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");

      // Redirect to sign-in after 2 seconds
      setTimeout(() => {
        router.replace("/sign-in");
      }, 2000);
    } catch (err: unknown) {
      const message =
        (err as Error)?.message ?? String(err ?? "Failed to update password");
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
            <Stack.Screen options={{ title: "Reset Password" }} />

            {/* HERO IMAGE */}
            <Image
              source={require("../../assets/images/auth-milk-image.png")}
              style={{ width: 260, height: 260 }}
              resizeMode="contain"
            />

            {/* HEADING */}
            <Text className="text-2xl font-bold text-center text-gray-800 mt-4">
              Create New Password
            </Text>
            <Text className="text-center text-gray-600 text-sm mt-2 px-2">
              Enter a strong password to secure your account
            </Text>

            {/* FORM */}
            <View className="w-full gap-4 mt-8">
              {/* TOKEN VERIFICATION ERROR */}
              {!validToken && error && (
                <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <Text className="text-red-800 text-sm font-medium">
                    ✗ {error}
                  </Text>
                  <Link href="/forgot-password" className="mt-3">
                    <Text className="text-blue-600 font-medium text-sm">
                      Request a new reset link
                    </Text>
                  </Link>
                </View>
              )}

              {/* PASSWORD */}
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="New Password"
                secureTextEntry
                placeholderTextColor="#9CA3AF"
                editable={!loading && !success && validToken}
                className="border border-gray-300 rounded-full px-5 py-3 bg-white text-black"
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
                  editable={!loading && !success && validToken}
                  className={`border rounded-full px-5 py-3 bg-white text-black ${
                    !isPasswordMatch ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {!isPasswordMatch && (
                  <Text className="text-red-500 text-xs mt-1 ml-2">
                    Passwords do not match
                  </Text>
                )}
              </View>

              {!!error && validToken && (
                <Text className="text-red-500 text-sm text-center">
                  {error}
                </Text>
              )}

              {success && (
                <View className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <Text className="text-green-800 text-sm font-medium">
                    ✓ Password updated successfully!
                  </Text>
                  <Text className="text-green-700 text-xs mt-1">
                    Redirecting to sign in...
                  </Text>
                </View>
              )}

              {/* RESET BUTTON */}
              <TouchableOpacity
                onPress={handleResetPassword}
                disabled={!isFormValid || loading || success || !validToken}
                className={`rounded-full py-3 items-center ${
                  !isFormValid || loading || success || !validToken
                    ? "bg-gray-300"
                    : "bg-black"
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold text-base">
                    Update Password
                  </Text>
                )}
              </TouchableOpacity>
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
