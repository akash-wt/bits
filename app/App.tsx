import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";
import { signInNonce } from "./solana/connectWallet";

export default function App() {
  const SIGN_IN_PAYLOAD = {
    domain: "yourdomain.com",
    nonce: "12sjdb784",
    statement: "Sign into React Native Sample App",
    uri: "https://bits.app",
  };

  const SIGN_IN_RESULT = {
    accounts: [
      {
        address: "gObY6t4/1KRzDjE8AhuzgkqRNYYhz0HSG707I2SEBCo=",
        label: "phantom-wallet",
      },
    ],
    auth_token:
      "eyJ0eXAiOiJwaGFudG9tLXdhbGxldC1hdXRoLXRva2VuIiwiaWlkIjoiMSIsInRpZCI6IjIifTf5fORlaneuQkWzkxWr34rvAaI53VFBLtJp0zIieRSC",
    sign_in_result: {
      address: "gObY6t4/1KRzDjE8AhuzgkqRNYYhz0HSG707I2SEBCo=",
      signature:
        "px1wlarjFmFq23BLMntN3KyLlAgMfSxeIOXruAlQkucMASdcMx8QjOUBjR7gD64NFto3Nnax5YORFDi0sA1GAA==",
      signed_message:
        "eW91cmRvbWFpbi5jb20gd2FudHMgeW91IHRvIHNpZ24gaW4gd2l0aCB5b3VyIFNvbGFuYSBhY2NvdW50Ogo5Z0JNQkRtdUREVVRTZGdpUTFTRzZ3RVprUDRYNUhGVnRZRFI1Q015dkZFeQoKU2lnbiBpbnRvIFJlYWN0IE5hdGl2ZSBTYW1wbGUgQXBwCgpVUkk6IGh0dHBzOi8vYml0cy5hcHAKTm9uY2U6IDEyc2pkYjc4NA",
    },
  };
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start on your app!</Text>
      {/* <Button
        title="verfiy wallet"
        onPress={verifySIWS(SIGN_IN_PAYLOAD,SIGN_IN_RESULT)}
      ></Button> */}
      <Button title="signin nonce" onPress={signInNonce}></Button>
      <StatusBar style="auto" />
    </View>
  );
}

/*
sign in nonce result {"accounts": [{"address": "gObY6t4/1KRzDjE8AhuzgkqRNYYhz0HSG707I2SEBCo=", "label": "phantom-wallet"}], "auth_token": "eyJ0eXAiOiJwaGFudG9tLXdhbGxldC1hdXRoLXRva2VuIiwiaWlkIjoiMSIsInRpZCI6IjIifTf5fORlaneuQkWzkxWr34rvAaI53VFBLtJp0zIieRSC", "sign_in_result": {"address": "gObY6t4/1KRzDjE8AhuzgkqRNYYhz0HSG707I2SEBCo=", "signature": "px1wlarjFmFq23BLMntN3KyLlAgMfSxeIOXruAlQkucMASdcMx8QjOUBjR7gD64NFto3Nnax5YORFDi0sA1GAA==", "signed_message": "eW91cmRvbWFpbi5jb20gd2FudHMgeW91IHRvIHNpZ24gaW4gd2l0aCB5b3VyIFNvbGFuYSBhY2NvdW50Ogo5Z0JNQkRtdUREVVRTZGdpUTFTRzZ3RVprUDRYNUhGVnRZRFI1Q015dkZFeQoKU2lnbiBpbnRvIFJlYWN0IE5hdGl2ZSBTYW1wbGUgQXBwCgpVUkk6IGh0dHBzOi8vYml0cy5hcHAKTm9uY2U6IDEyc2pkYjc4NA"}}

*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
});
