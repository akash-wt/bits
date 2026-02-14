import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";
import { connectWallet, signInNonce } from "./solana/connectWallet";
import { useState } from "react";

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start on your app!</Text>
      <Button title="verfiy wallet" onPress={connectWallet}></Button>
      <Button title="signin nonce" onPress={signInNonce}></Button>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
});
