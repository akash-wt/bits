import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { checkUserExist } from "@/lib/walletAuth";
import { mmkvStorage } from "@/lib/storage";
import { ImageBackground } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("before checkUserExist");

      const result = await checkUserExist();

      console.log("result =>  ", result?.data);

      if (!result?.data.verified) {
        throw new Error("Authentication failed");
      }

      // Store auth securely
      mmkvStorage.setItem(
        "auth_user",
        JSON.stringify({
          publicKey: result.data.user.pubKey,
          token: result.data.token,
        }),
      );

      // Redirect to app
      router.replace("/(tabs)");
    } catch (e: any) {
      console.log("Login error:", e);
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/auth.png")}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.6)",
          padding: 24,
        }}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#000000" />

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={{
            backgroundColor: "#000000",
            paddingVertical: 14,
            paddingHorizontal: 32,
            width: "100%",
            alignItems: "center",
          }}
        >
          {loading ? (
            <View
              style={{
                backgroundColor: "#000000",
                paddingHorizontal: 20,
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 21,
                  letterSpacing: 2,
                  paddingVertical: 20,
                  fontFamily: "VT323_400Regular",
                }}
              >
                Fetching your Account...
              </Text>
            </View>
          ) : (
            <Text
              style={{
                color: "#ffffff",
                fontWeight: "600",
                fontSize: 25,
                letterSpacing: 2,
                fontFamily: "VT323_400Regular",
              }}
            >
              Connect Solana Wallet
            </Text>
          )}
        </TouchableOpacity>

        {error && (
          <Text
            style={{
              color: "#ef4444",
              marginTop: 20,
              fontSize: 20,
              padding: 10,
              backgroundColor: "#000000",
              textAlign: "center",
              letterSpacing: 2,
              fontFamily: "VT323_400Regular",
            }}
          >
            {error}
          </Text>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}
