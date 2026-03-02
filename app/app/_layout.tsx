import { Stack, Slot, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { mmkvStorage } from "@/lib/storage";
import { Redirect } from "expo-router";
import "../src/polyfills";
import { useFonts, VT323_400Regular } from "@expo-google-fonts/vt323";

export default function RootLayout() {
  const segments = useSegments();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [fontsLoaded] = useFonts({
    VT323_400Regular,
  });

  useEffect(() => {
    const authRaw = mmkvStorage.getItem("auth_user");
    setIsLoggedIn(!!authRaw); // return true if data exists
  }, []);
  if (isLoggedIn === null) {
    return null;
  }
  const inAuthGroup = segments[0] === "(auth)";
  if (!isLoggedIn && !inAuthGroup) {
    return <Redirect href="/(auth)/login" />;
  }
  if (isLoggedIn && inAuthGroup) {
    return <Redirect href="/(tabs)" />;
  }

  if (!fontsLoaded) {
    return null; 
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="chat/[reciverKey]" />
      </Stack>
    </SafeAreaProvider>
  );
}
