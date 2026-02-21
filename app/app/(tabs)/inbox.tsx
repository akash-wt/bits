import { useState, useRef } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  FlatList,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// ─── Types ────────────────────────────────────────────────────────────────────
type Reaction = "❤️" | "😂" | "😮" | "😢" | "🔥";

type Message = {
  id: string;
  text: string;
  receivedAt: string;
  isRead: boolean;
  reaction: Reaction | null;
  replies: { id: string; text: string; sentAt: string }[];
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    text: "I've always admired the way you handle pressure. You make it look so easy.",
    receivedAt: "2025-02-21T09:41:00Z",
    isRead: false,
    reaction: null,
    replies: [],
  },
  {
    id: "2",
    text: "Your presentation last week was genuinely impressive. Everyone was talking about it.",
    receivedAt: "2025-02-21T08:15:00Z",
    isRead: false,
    reaction: "❤️",
    replies: [{ id: "r1", text: "Thank you so much! That means a lot.", sentAt: "2025-02-21T08:30:00Z" }],
  },
  {
    id: "3",
    text: "Just wanted to say you've been a great friend without even knowing it.",
    receivedAt: "2025-02-20T22:10:00Z",
    isRead: true,
    reaction: null,
    replies: [],
  },
  {
    id: "4",
    text: "I look up to you more than you'll ever know.",
    receivedAt: "2025-02-20T18:03:00Z",
    isRead: true,
    reaction: "🔥",
    replies: [],
  },
  {
    id: "5",
    text: "You have a really unique way of seeing things. It's refreshing.",
    receivedAt: "2025-02-19T14:55:00Z",
    isRead: true,
    reaction: null,
    replies: [],
  },
];

const REACTIONS: Reaction[] = ["❤️", "😂", "😮", "😢", "🔥"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Reply Modal ──────────────────────────────────────────────────────────────
function ReplyModal({
  visible,
  message,
  onClose,
  onSend,
}: {
  visible: boolean;
  message: Message | null;
  onClose: () => void;
  onSend: (id: string, text: string) => void;
}) {
  const [replyText, setReplyText] = useState("");

  const handleSend = () => {
    if (!replyText.trim() || !message) return;
    onSend(message.id, replyText.trim());
    setReplyText("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Reply Anonymously</Text>
          <Text style={styles.modalNote}>
            They won't know who you are — reply with kindness.
          </Text>

          {message && (
            <View style={styles.originalMsgBox}>
              <Text style={styles.originalMsgLabel}>Original message</Text>
              <Text style={styles.originalMsgText} numberOfLines={2}>
                {message.text}
              </Text>
            </View>
          )}

          <TextInput
            style={styles.replyInput}
            placeholder="Write your reply..."
            placeholderTextColor="#94a3b8"
            value={replyText}
            onChangeText={setReplyText}
            multiline
            maxLength={300}
            autoFocus
          />
          <Text style={styles.charCount}>{replyText.length}/300</Text>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sendBtn, !replyText.trim() && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!replyText.trim()}
            >
              <Text style={styles.sendBtnText}>Send Reply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Reaction Picker ──────────────────────────────────────────────────────────
function ReactionPicker({
  visible,
  onSelect,
  onClose,
}: {
  visible: boolean;
  onSelect: (r: Reaction) => void;
  onClose: () => void;
}) {
  if (!visible) return null;
  return (
    <TouchableOpacity style={styles.reactionOverlay} activeOpacity={1} onPress={onClose}>
      <View style={styles.reactionPicker}>
        {REACTIONS.map((r) => (
          <TouchableOpacity
            key={r}
            style={styles.reactionOption}
            onPress={() => onSelect(r)}
          >
            <Text style={styles.reactionEmoji}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  );
}

// ─── Message Card ─────────────────────────────────────────────────────────────
function MessageCard({
  message,
  onReply,
  onReact,
  onDelete,
  onReport,
}: {
  message: Message;
  onReply: () => void;
  onReact: (id: string) => void;
  onDelete: () => void;
  onReport: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[styles.card, !message.isRead && styles.cardUnread]}>
      {/* Unread dot */}
      {!message.isRead && <View style={styles.unreadDot} />}

      {/* Top row */}
      <View style={styles.cardHeader}>
        <View style={styles.anonBadge}>
          <Text style={styles.anonIcon}>👤</Text>
          <Text style={styles.anonLabel}>Anonymous</Text>
        </View>
        <Text style={styles.timeText}>{formatDate(message.receivedAt)}</Text>
      </View>

      {/* Message text */}
      <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
        <Text style={styles.messageText} numberOfLines={expanded ? undefined : 3}>
          {message.text}
        </Text>
        {message.text.length > 120 && (
          <Text style={styles.expandToggle}>{expanded ? "Show less" : "Read more"}</Text>
        )}
      </TouchableOpacity>

      {/* Reaction display */}
      {message.reaction && (
        <View style={styles.reactionDisplay}>
          <Text style={styles.reactionDisplayText}>{message.reaction}</Text>
        </View>
      )}

      {/* Replies preview */}
      {message.replies.length > 0 && (
        <View style={styles.replyPreview}>
          <Text style={styles.replyPreviewLabel}>Your reply</Text>
          <Text style={styles.replyPreviewText} numberOfLines={2}>
            {message.replies[message.replies.length - 1].text}
          </Text>
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onReply}>
          <Text style={styles.actionIcon}>↩️</Text>
          <Text style={styles.actionText}>Reply</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={() => onReact(message.id)}>
          <Text style={styles.actionIcon}>{message.reaction ?? "🤍"}</Text>
          <Text style={styles.actionText}>React</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onReport}>
          <Text style={styles.actionIcon}>🚩</Text>
          <Text style={styles.actionText}>Report</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={onDelete}>
          <Text style={styles.actionIcon}>🗑️</Text>
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function InboxScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);
  const [reactionTarget, setReactionTarget] = useState<string | null>(null);

  const unreadCount = messages.filter((m) => !m.isRead).length;

  const filtered = messages.filter((m) => {
    if (filter === "unread") return !m.isRead;
    return true;
  });

  // Mark as read on open
  const handleOpenReply = (msg: Message) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m))
    );
    setReplyTarget(msg);
  };

  const handleSendReply = (id: string, text: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              replies: [
                ...m.replies,
                { id: Date.now().toString(), text, sentAt: new Date().toISOString() },
              ],
            }
          : m
      )
    );
  };

  const handleReact = (id: string, reaction: Reaction) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, reaction: m.reaction === reaction ? null : reaction }
          : m
      )
    );
    setReactionTarget(null);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Message",
      "This message will be permanently removed from your inbox.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => setMessages((prev) => prev.filter((m) => m.id !== id)),
        },
      ]
    );
  };

  const handleReport = (id: string) => {
    Alert.alert(
      "Report Message",
      "Why are you reporting this message?",
      [
        { text: "Harassment", onPress: () => handleDelete(id) },
        { text: "Inappropriate content", onPress: () => handleDelete(id) },
        { text: "Spam", onPress: () => handleDelete(id) },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleMarkAllRead = () => {
    setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Inbox</Text>
          {unreadCount > 0 ? (
            <Text style={styles.headerSub}>{unreadCount} new messages</Text>
          ) : (
            <Text style={styles.headerSub}>All caught up</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markReadBtn} onPress={handleMarkAllRead}>
            <Text style={styles.markReadText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={filter === "all" ? styles.tabActive : styles.tab}
          onPress={() => setFilter("all")}
        >
          <Text style={filter === "all" ? styles.tabTextActive : styles.tabText}>
            All ({messages.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={filter === "unread" ? styles.tabActive : styles.tab}
          onPress={() => setFilter("unread")}
        >
          <Text style={filter === "unread" ? styles.tabTextActive : styles.tabText}>
            Unread {unreadCount > 0 ? `(${unreadCount})` : ""}
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageCard
            message={item}
            onReply={() => handleOpenReply(item)}
            onReact={() => setReactionTarget(item.id)}
            onDelete={() => handleDelete(item.id)}
            onReport={() => handleReport(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySub}>
              Anonymous messages you receive will appear here.
            </Text>
          </View>
        }
      />

      {/* Reaction Picker */}
      <ReactionPicker
        visible={!!reactionTarget}
        onSelect={(r) => reactionTarget && handleReact(reactionTarget, r)}
        onClose={() => setReactionTarget(null)}
      />

      {/* Reply Modal */}
      <ReplyModal
        visible={!!replyTarget}
        message={replyTarget}
        onClose={() => setReplyTarget(null)}
        onSend={handleSendReply}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  markReadBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  markReadText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },

  // Filter tabs
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  tabActive: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0f172a",
    backgroundColor: "#0f172a",
  },
  tabText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  tabTextActive: {
    fontSize: 13,
    color: "#ffffff",
    fontWeight: "600",
  },

  // List
  listContent: {
    padding: 16,
    gap: 12,
  },

  // Card
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    position: "relative",
    marginBottom: 12,
  },
  cardUnread: {
    borderColor: "#94a3b8",
    backgroundColor: "#fafbff",
  },
  unreadDot: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0f172a",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  anonBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  anonIcon: { fontSize: 12 },
  anonLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    letterSpacing: 0.3,
  },
  timeText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  messageText: {
    fontSize: 15,
    color: "#1e293b",
    lineHeight: 22,
    fontStyle: "italic",
  },
  expandToggle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    fontWeight: "500",
    textDecorationLine: "underline",
  },

  // Reaction
  reactionDisplay: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  reactionDisplayText: { fontSize: 16 },

  // Reply preview
  replyPreview: {
    marginTop: 10,
    backgroundColor: "#f8fafc",
    borderLeftWidth: 3,
    borderLeftColor: "#cbd5e1",
    paddingLeft: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  replyPreviewLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  replyPreviewText: {
    fontSize: 13,
    color: "#475569",
  },

  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 12,
  },

  // Actions
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  actionIcon: { fontSize: 18 },
  actionText: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
  },
  deleteBtn: {},
  deleteText: {
    color: "#ef4444",
  },

  // Reaction picker
  reactionOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  reactionPicker: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 40,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  reactionOption: {
    padding: 6,
  },
  reactionEmoji: { fontSize: 28 },

  // Reply modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  modalNote: {
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 16,
  },
  originalMsgBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: "#cbd5e1",
  },
  originalMsgLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  originalMsgText: {
    fontSize: 13,
    color: "#475569",
    fontStyle: "italic",
  },
  replyInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#1e293b",
    minHeight: 100,
    textAlignVertical: "top",
    backgroundColor: "#f8fafc",
  },
  charCount: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "right",
    marginTop: 6,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748b",
  },
  sendBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    alignItems: "center",
  },
  sendBtnDisabled: {
    backgroundColor: "#94a3b8",
  },
  sendBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
    gap: 8,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  emptySub: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    maxWidth: 240,
  },
});