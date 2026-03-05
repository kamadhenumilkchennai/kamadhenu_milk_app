import { Stack } from "expo-router";
import React from "react";

export default function Orderlayout() {
  return (
    <Stack>
      {/* Register the index child route and allow the dynamic [id] route to be resolved automatically */}
      <Stack.Screen
        name="index"
        options={{ title: "Users", headerShown: true }}
      />
    </Stack>
  );
}
