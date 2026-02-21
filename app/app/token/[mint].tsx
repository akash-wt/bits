import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TokenDetailScreen() {
  // Read the dynamic parameter from the URL
  // If URL is /token/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
  // then mint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
  const { mint } = useLocalSearchParams<{ mint: string }>();
  const router = useRouter();

  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch token metadata
    // For now, we'll use a simple approach
    // Later you can integrate Jupiter or Helius API for richer data
    fetchTokenInfo();
  }, [mint]);

  const fetchTokenInfo = async () => {
    try {
      // Using Solana RPC to get token supply info
      const res = await fetch("https://api.mainnet-beta.solana.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getTokenSupply",
          params: [mint],
        }),
      });
      const json = await res.json();

      setTokenInfo({
        mint: mint,
        supply: json.result?.value?.uiAmount || 0,
        decimals: json.result?.value?.decimals || 0,
      });
    } catch (error) {
      console.error("Failed to fetch token info:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#14F195" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {/* Token Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Token Details</Text>
      </View>

      {/* Mint Address */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Mint Address</Text>
        <Text style={styles.mintAddress}>{mint}</Text>
      </View>

      {/* Token Info */}
      {tokenInfo && (
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Supply</Text>
            <Text style={styles.infoValue}>
              {tokenInfo.supply?.toLocaleString() || "Unknown"}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Decimals</Text>
            <Text style={styles.infoValue}>{tokenInfo.decimals}</Text>
          </View>
        </View>
      )}

      {/* View on Solscan */}
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => {
          // We'll add Linking.openURL later
          // For now this is a placeholder
        }}
      >
        <Text style={styles.linkButtonText}>View on Solscan ↗</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a1a",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a1a",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardLabel: {
    color: "#888",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  mintAddress: {
    color: "#9945FF",
    fontSize: 13,
    fontFamily: "monospace",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoLabel: {
    color: "#888",
    fontSize: 14,
  },
  infoValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#2a2a3e",
  },
  linkButton: {
    backgroundColor: "#9945FF20",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  linkButtonText: {
    color: "#9945FF",
    fontSize: 14,
    fontWeight: "600",
  },
});
