import { Stack } from "expo-router";
import React from "react";

export default function Orderlayout() {
  return (
    <Stack>
      {/* <Stack.Screen name="index" options={{ title: "Orders" }} /> */}
       <Stack.Screen name="list" options={{ headerShown: false }} />
    </Stack>
  );
}

