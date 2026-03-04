import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useChatStore } from "@/stores/chats";
import { ChatMessage } from "@/stores/chats";
import { mmkvStorage } from "@/lib/storage";
import { Feather, Ionicons } from "@expo/vector-icons";
import { shortenKey } from "@/lib/trimString";
import { PublicKey } from "@solana/web3.js";
import { socket } from "@/socket/socket";
import { currentUser } from "@/config";

export default function ChatScreen() {
  const router = useRouter();
  const { chats } = useChatStore();
  const [showModal, setShowModal] = useState(false);
  const [newChatPubKey, setNewChatPubKey] = useState("");
  const authRaw = mmkvStorage.getItem("auth_user");
  const user = authRaw ? JSON.parse(authRaw) : null;
  const shortKey = user?.publicKey ? shortenKey(user.publicKey) : "";
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });

      // 1. register user to server
      socket.emit("register", currentUser);

      socket.emit("get_everything",currentUser);
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  // Converts rooms object → array
  const rooms = Object.entries(chats).map(([roomId, room]) => {
    const lastMessage = room.messages[room.messages.length - 1];

    return {
      roomId,
      lastMessage,
      unreadCount: room.unreadCount,
    };
  });

  const totalUnread = rooms.reduce((sum, room) => sum + room.unreadCount, 0);

  const filtered = rooms.filter((room) => {
    const matchSearch =
      room.roomId.toLowerCase().includes(search.toLowerCase()) ||
      room.lastMessage?.text.toLowerCase().includes(search.toLowerCase());
    if (filter === "unread") {
      return matchSearch && room.unreadCount > 0;
    }
    return matchSearch;
  });

  function ChatRow({
    room,
    onPress,
  }: {
    room: {
      roomId: string;
      lastMessage?: ChatMessage;
      unreadCount: number;
    };
    onPress: () => void;
  }) {
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.chatInfo}>
          <View style={styles.chatTop}>
            <Text style={styles.chatName} numberOfLines={1}>
              {room.roomId}
            </Text>

            {room.lastMessage && (
              <Text style={styles.chatTime}>
                {new Date(room.lastMessage.createdAt).toLocaleTimeString()}
              </Text>
            )}
          </View>

          <View style={styles.chatBottom}>
            <Text style={styles.lastMsg} numberOfLines={1}>
              {room.lastMessage?.text || "No messages yet"}
            </Text>

            {room.unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {room.unreadCount > 9 ? "9+" : room.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 12,
          backgroundColor: "#000000",
        }}
      >
        {/* App Name */}
        <Text
          style={{
            fontSize: 35,
            color: "#ffffff",
            fontFamily: "VT323_400Regular",
          }}
        >
          Bits
        </Text>

        {/* User Public Key */}
        {shortKey ? (
          <View style={styles.pixelButton}>
            <Ionicons name="wallet" size={20} color="white" />
            <Text style={styles.pixelText}>{shortKey}</Text>
          </View>
        ) : null}
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <TextInput
            placeholder="Search"
            placeholderTextColor="#000000"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInputNew}
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showModal && (
        <View style={styles.showModelMain} pointerEvents="auto">
          <View
            style={{
              backgroundColor: "#000000",
              padding: 20,
            }}
          >
            <Text style={styles.showModelText}>Enter Recipient Public Key</Text>

            <TextInput
              value={newChatPubKey}
              onChangeText={setNewChatPubKey}
              placeholder="Solana Public Key"
              placeholderTextColor="#000000"
              style={styles.showModelTextInput}
            />

            <TouchableOpacity
              onPress={() => {
                try {
                  const trimmed = newChatPubKey.trim();
                  if (!trimmed) return;
                  const chatPubKey = new PublicKey(trimmed);

                  router.push({
                    pathname: "/chat/[roomId]",
                    params: { roomId: chatPubKey.toBase58() },
                  });

                  setNewChatPubKey("");
                  setShowModal(false);
                } catch {
                  Alert.alert(
                    "Invalid Public Key",
                    "Please enter a valid Solana address.",
                  );
                }
              }}
              style={styles.showModelNewChatButton}
            >
              <Text style={styles.showModelNewChatButtonText}>Start Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={{ marginTop: 10, alignItems: "center" }}
            >
              <Text style={styles.showModelCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Filter */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={filter === "all" ? styles.tabActive : styles.tab}
          onPress={() => setFilter("all")}
        >
          <Text
            style={filter === "all" ? styles.tabTextActive : styles.tabText}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={filter === "unread" ? styles.tabActive : styles.tab}
          onPress={() => setFilter("unread")}
        >
          <Text
            style={filter === "unread" ? styles.tabTextActive : styles.tabText}
          >
            Unread {totalUnread > 0 ? `(${totalUnread})` : ""}
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        style={{ backgroundColor: "#ffffff" }}
        keyboardShouldPersistTaps="handled"
        data={filtered}
        keyExtractor={(item) => item.roomId}
        renderItem={({ item }) => (
          <ChatRow
            room={{
              ...item,
              roomId: shortenKey(item.roomId.toString()),
            }}
            onPress={() => router.push(`chat/${item.roomId}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🕳️</Text>
            <Text style={styles.emptyText}>No chats found</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={filtered.length === 0 ? { flex: 1 } : undefined}
      />

      <TouchableOpacity
        onPress={() => setShowModal(true)}
        style={styles.newChat}
        activeOpacity={0.8}
      >
        <Feather name="message-circle" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000000" },

  // search bar
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    backgroundColor: "#ffffff",
  },

  clearIcon: {
    color: "#000000",
    fontSize: 20,
    paddingLeft: 10,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderColor: "#000000",
  },

  searchInputNew: {
    flex: 1,
    color: "#000000",
    fontSize: 20,
    letterSpacing: 2,
    fontFamily: "VT323_400Regular",
  },

  // filter options
  filterRow: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    paddingHorizontal: 20,
    // marginBottom: 0.5,
    gap: 8,
  },

  tab: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: "#000000",
  },

  tabActive: {
    paddingHorizontal: 16,
    paddingVertical: 2,
    marginVertical: 4,
    backgroundColor: "#000000",
  },

  tabText: {
    color: "#000000",
    fontSize: 18,
    fontFamily: "VT323_400Regular",
  },

  tabTextActive: {
    color: "#ffffff",
    fontSize: 18,
    fontFamily: "VT323_400Regular",
  },

  // chats
  chatItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.2,
    borderBottomColor: "#000000",
  },

  chatInfo: { flex: 1 },

  chatTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  chatName: {
    fontSize: 22,
    letterSpacing: 2,
    fontFamily: "VT323_400Regular",
    color: "#000000",
  },

  chatTime: {
    fontSize: 18,
    fontFamily: "VT323_400Regular",
    color: "#000000",
  },

  chatBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  lastMsg: {
    letterSpacing: 1,
    fontSize: 18,
    color: "#000000",
    flex: 1,
    fontFamily: "VT323_400Regular",
  },

  badge: {
    backgroundColor: "#000000",
    paddingHorizontal: 6,
    textAlign: "center",
  },

  badgeText: {
    color: "#ffffff",
    fontFamily: "VT323_400Regular",
    fontSize: 16,
  },
  // when there is no chats

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // new chat
  newChat: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 50,
    borderRadius: 3,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    // Elevation (Android)
    elevation: 8,
  },

  showModelMain: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 24,
    zIndex: 999,
    elevation: 10,
  },

  showModelTextInput: {
    backgroundColor: "#ffffff",
    color: "#000000",
    padding: 12,
    marginBottom: 16,
    fontFamily: "VT323_400Regular",
    fontSize: 18,
    letterSpacing: 2,
  },
  showModelText: {
    fontFamily: "VT323_400Regular",
    fontSize: 20,
    letterSpacing: 2,
    color: "#ffffff",
    marginBottom: 12,
  },
  showModelNewChatButton: {
    backgroundColor: "#ffffff",
    padding: 12,
    alignItems: "center",
  },

  showModelNewChatButtonText: {
    color: "#000000",
    fontFamily: "VT323_400Regular",
    fontSize: 20,
    letterSpacing: 2,
  },
  showModelCancelText: {
    color: "#ffffff",
    fontFamily: "VT323_400Regular",
    fontSize: 20,
    letterSpacing: 2,
  },

  pixelButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10, // spacing between icon and text
    backgroundColor: "#000000",
  },

  pixelText: {
    fontSize: 22,
    color: "#ffffff",
    fontFamily: "VT323_400Regular",
    letterSpacing: 2,
  },

  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: "#000000", fontSize: 14 },
});
