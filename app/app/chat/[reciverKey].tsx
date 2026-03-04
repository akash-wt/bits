import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ChatMessage, useChatStore } from "@/stores/chats";
import { SafeAreaView } from "react-native-safe-area-context";
import getRandomUuid from "@/lib/UUID";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { shortenKey } from "@/lib/trimString";
import { currentUser } from "@/config";
import { socket } from "@/socket/socket";
import { useEffect } from "react";

export default function ChatDetail() {
  const { reciverKey } = useLocalSearchParams();
  const { chats, addMessage } = useChatStore();
  const router = useRouter();

  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const reciverData = reciverKey ? chats[reciverKey.toString()] : undefined;
  const messages = reciverData?.messages ?? [];

  useEffect(() => {
    // 1. register user too server
    socket.emit("register", currentUser);

    // fetch all messges when we open chat
    const data = socket.emit("get_messages", {
      senderKey: currentUser,
      reciverKey,
    });

    // hydrate store with history
    socket.on("message_history", (messages: ChatMessage[]) => {
      messages.forEach((msg) => {
        useChatStore.getState().addMessage(reciverKey.toString(), msg);
      });
    });

    // listen for new incoming messages while chat is open
    socket.on("receive_message", (msg: ChatMessage) => {
      useChatStore.getState().addMessage(reciverKey.toString(), msg);
    });
    return () => {
      socket.off("message_history");
      socket.off("receive_message");
    };
  }, [reciverKey]);

  const sendMessage = () => {
    if (!reciverKey) {
      console.log("no reciverKey found while sending message");
      return;
    }
    if (!currentUser) {
      console.log("no  currentUser found while sending message");
      return;
    }
    if (input == "") {
      return;
    }

    const message: ChatMessage = {
      id: getRandomUuid(),
      text: input.trim(),
      senderKey: currentUser,
      reciverKey: reciverKey.toString(),
      createdAt: Date.now(),
      status: "sent",
    };

    addMessage(reciverKey.toString(), message); // added to local storage
    setInput("");
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 50);

    socket.emit("send_message", message); // sent to server for broadcast
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      {/* Back Button */}
      <TouchableOpacity
        style={{
          backgroundColor: "#000000",
          paddingLeft: 15,
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 10,
          paddingBottom: 10,
          paddingTop: 10,
        }}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#ffffff" />
        <Text
          style={{
            color: "#fff",
            marginLeft: 8,
            fontFamily: "VT323_400Regular",
            fontSize: 20,
            letterSpacing: 2,
          }}
        >
          {shortenKey(reciverKey.toString())}
        </Text>
      </TouchableOpacity>

      <FlatList
        style={{ backgroundColor: "#ffffff" }}
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const isMe = item.senderKey === currentUser;          

          return (
            <View
              style={{
                alignSelf: isMe ? "flex-end" : "flex-start",
                backgroundColor: isMe ? "#000000" : "#000000",
                padding: 10,
                marginBottom: 8,
                maxWidth: "75%",
              }}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontFamily: "VT323_400Regular",
                  fontSize: 18,
                  letterSpacing: 0.5,
                }}
              >
                {item.text}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: "#cbd5e1",
                  marginTop: 4,
                  textAlign: "right",
                }}
              >
                {new Date(item.createdAt).toLocaleTimeString()}
              </Text>
            </View>
          );
        }}
      />

      {/* Input */}
      <View
        style={{
          flexDirection: "row",
          padding: 12,
          borderTopWidth: 1,
          backgroundColor: "#ffffff",
        }}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor="#ffffff"
          style={{
            flex: 1,
            fontFamily: "VT323_400Regular",
            fontSize: 18,
            letterSpacing: 2,
            backgroundColor: "#000000",
            color: "#ffffff",
            paddingHorizontal: 16,
            paddingVertical: 10,
            marginRight: 10,
          }}
        />

        <TouchableOpacity
          onPress={sendMessage}
          style={{
            backgroundColor: "#000000",
            paddingHorizontal: 20,
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "#ffffff",
              fontFamily: "VT323_400Regular",
              fontSize: 18,
              letterSpacing: 2,
            }}
          >
            Send
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
