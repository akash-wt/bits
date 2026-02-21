import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

type Chat = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  color: string;
};

const MOCK_CHATS: Chat[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    avatar: "SJ",
    lastMessage: "Hey! Are we still on for tomorrow?",
    time: "9:41 AM",
    unread: 3,
    online: true,
    color: "#FF6B6B",
  },
  {
    id: "2",
    name: "Marcus Chen",
    avatar: "MC",
    lastMessage: "The design files are ready for review 🎨",
    time: "Yesterday",
    unread: 0,
    online: false,
    color: "#4ECDC4",
  },
  {
    id: "3",
    name: "Team Alpha",
    avatar: "TA",
    lastMessage: "Alex: Sprint planning at 3pm today",
    time: "Yesterday",
    unread: 12,
    online: true,
    color: "#A78BFA",
  },
  {
    id: "4",
    name: "Emma Davis",
    avatar: "ED",
    lastMessage: "Thanks so much! You're the best 🙏",
    time: "Mon",
    unread: 0,
    online: false,
    color: "#F59E0B",
  },
  {
    id: "5",
    name: "Dev Team",
    avatar: "DT",
    lastMessage: "Build failed on staging — anyone on this?",
    time: "Mon",
    unread: 5,
    online: true,
    color: "#10B981",
  },
  {
    id: "6",
    name: "Raj Patel",
    avatar: "RP",
    lastMessage: "Sent you the invoice for last month",
    time: "Sun",
    unread: 0,
    online: false,
    color: "#3B82F6",
  },
  {
    id: "7",
    name: "Lena Müller",
    avatar: "LM",
    lastMessage: "Can't make it to the call, sorry!",
    time: "Sat",
    unread: 0,
    online: false,
    color: "#EC4899",
  },
  {
    id: "8",
    name: "Product Guild",
    avatar: "PG",
    lastMessage: "Nadia: New roadmap is up on Notion",
    time: "Fri",
    unread: 0,
    online: false,
    color: "#F97316",
  },
];

// ─── Chat Row ────────────────────────────────────────────────────────────────
function ChatRow({ chat, onPress }: { chat: Chat; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.chatItem} onPress={onPress} activeOpacity={0.7}>
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <View style={[styles.avatar, { backgroundColor: chat.color + "22", borderColor: chat.color + "66" }]}>
          <Text style={[styles.avatarText, { color: chat.color }]}>{chat.avatar}</Text>
        </View>
        {chat.online && <View style={styles.onlineDot} />}
      </View>

      {/* Info */}
      <View style={styles.chatInfo}>
        <View style={styles.chatTop}>
          <Text style={styles.chatName} numberOfLines={1}>{chat.name}</Text>
          <Text style={styles.chatTime}>{chat.time}</Text>
        </View>
        <View style={styles.chatBottom}>
          <Text style={styles.lastMsg} numberOfLines={1}>{chat.lastMessage}</Text>
          {chat.unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{chat.unread > 9 ? "9+" : chat.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const totalUnread = MOCK_CHATS.filter((c) => c.unread > 0).reduce(
    (sum, c) => sum + c.unread,
    0
  );

  const filtered = MOCK_CHATS.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase());
    if (filter === "unread") return matchSearch && c.unread > 0;
    return matchSearch;
  });

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1e" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSub}>{MOCK_CHATS.length} conversations</Text>
        </View>
        <TouchableOpacity style={styles.composeBtn} activeOpacity={0.7}>
          <Text style={styles.composeIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          placeholderTextColor="#475569"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={filter === "all" ? styles.tabActive : styles.tab}
          onPress={() => setFilter("all")}
        >
          <Text style={filter === "all" ? styles.tabTextActive : styles.tabText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={filter === "unread" ? styles.tabActive : styles.tab}
          onPress={() => setFilter("unread")}
        >
          <Text style={filter === "unread" ? styles.tabTextActive : styles.tabText}>
            Unread {totalUnread > 0 ? `(${totalUnread})` : ""}
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatRow
            chat={item}
            onPress={() => router.push(`chat/${item.id}`)}
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
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0a0f1e",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#f1f5f9",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  composeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  composeIcon: { fontSize: 18 },

  // Search
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchIcon: { fontSize: 14, opacity: 0.5 },
  searchInput: {
    flex: 1,
    color: "#e2e8f0",
    fontSize: 15,
    padding: 0,
  },
  clearBtn: {
    color: "#64748b",
    fontSize: 13,
    paddingLeft: 6,
  },

  // Filter tabs
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  tabActive: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#6366f1",
    backgroundColor: "rgba(99,102,241,0.15)",
  },
  tabText: {
    color: "#64748b",
    fontSize: 13,
  },
  tabTextActive: {
    color: "#a5b4fc",
    fontSize: 13,
    fontWeight: "600",
  },

  // Chat item
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  avatarWrap: {
    position: "relative",
    marginRight: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: "#0a0f1e",
  },
  chatInfo: {
    flex: 1,
    minWidth: 0,
  },
  chatTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f1f5f9",
    flex: 1,
    marginRight: 8,
  },
  chatTime: {
    fontSize: 12,
    color: "#475569",
  },
  chatBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMsg: {
    fontSize: 14,
    color: "#64748b",
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: "#6366f1",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  // Empty state
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: "#94a3b8", fontSize: 15 },
});