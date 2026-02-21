import { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  TextInput,
  Alert,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

// ─── Types ────────────────────────────────────────────────────────────────────
type BlockedUser = { id: string; name: string; blockedAt: string };

// ─── Mock State ───────────────────────────────────────────────────────────────
const MOCK_PROFILE = {
  name: "Jordan Blake",
  username: "jordanblake",
  email: "jordan@example.com",
  avatarInitials: "JB",
  avatarColor: "#6366f1",
};

const MOCK_BLOCKED: BlockedUser[] = [
  { id: "b1", name: "Anonymous #4821", blockedAt: "Feb 18, 2025" },
  { id: "b2", name: "Anonymous #1093", blockedAt: "Feb 10, 2025" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  subtitle,
  onPress,
  right,
  danger,
  noBorder,
}: {
  icon: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
  noBorder?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, noBorder && styles.rowNoBorder]}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      disabled={!onPress && !right}
    >
      <View style={styles.rowIcon}>
        <Text style={styles.rowIconText}>{icon}</Text>
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>
          {label}
        </Text>
        {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
      {right ? (
        <View style={styles.rowRight}>{right}</View>
      ) : onPress ? (
        <Text style={styles.chevron}>›</Text>
      ) : null}
    </TouchableOpacity>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
function EditProfileModal({
  visible,
  profile,
  onClose,
  onSave,
}: {
  visible: boolean;
  profile: typeof MOCK_PROFILE;
  onClose: () => void;
  onSave: (p: typeof MOCK_PROFILE) => void;
}) {
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [email, setEmail] = useState(profile.email);

  const handleSave = () => {
    if (!name.trim() || !username.trim()) {
      Alert.alert("Error", "Name and username are required.");
      return;
    }
    onSave({
      ...profile,
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Edit Profile</Text>

          <Text style={styles.inputLabel}>Display Name</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.inputLabel}>Username</Text>
          <View style={styles.inputWithPrefix}>
            <Text style={styles.inputPrefix}>@</Text>
            <TextInput
              style={[styles.textInput, { flex: 1, marginBottom: 0 }]}
              value={username}
              onChangeText={(v) =>
                setUsername(v.toLowerCase().replace(/\s/g, ""))
              }
              placeholder="username"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Block List Modal ─────────────────────────────────────────────────────────
function BlockListModal({
  visible,
  blocked,
  onClose,
  onUnblock,
}: {
  visible: boolean;
  blocked: BlockedUser[];
  onClose: () => void;
  onUnblock: (id: string) => void;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.modalSheet, { minHeight: 320 }]}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Blocked Users</Text>
          <Text style={styles.modalNote}>
            Blocked senders cannot message you.
          </Text>

          {blocked.length === 0 ? (
            <View style={styles.emptyBlocked}>
              <Text style={styles.emptyBlockedIcon}>🚫</Text>
              <Text style={styles.emptyBlockedText}>No blocked users</Text>
            </View>
          ) : (
            blocked.map((u) => (
              <View key={u.id} style={styles.blockedRow}>
                <View>
                  <Text style={styles.blockedName}>{u.name}</Text>
                  <Text style={styles.blockedDate}>Blocked {u.blockedAt}</Text>
                </View>
                <TouchableOpacity
                  style={styles.unblockBtn}
                  onPress={() => onUnblock(u.id)}
                >
                  <Text style={styles.unblockBtnText}>Unblock</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Change Password Modal ────────────────────────────────────────────────────
function ChangePasswordModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSave = () => {
    if (!current || !next || !confirm) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
    if (next !== confirm) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }
    if (next.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters.");
      return;
    }
    Alert.alert("Success", "Password updated successfully.");
    setCurrent("");
    setNext("");
    setConfirm("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Change Password</Text>

          {[
            { label: "Current Password", val: current, set: setCurrent },
            { label: "New Password", val: next, set: setNext },
            { label: "Confirm New Password", val: confirm, set: setConfirm },
          ].map(({ label, val, set }) => (
            <View key={label}>
              <Text style={styles.inputLabel}>{label}</Text>
              <TextInput
                style={styles.textInput}
                value={val}
                onChangeText={set}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
              />
            </View>
          ))}

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SettingScreen() {
  const router = useRouter();

  const [profile, setProfile] = useState(MOCK_PROFILE);
  const [blocked, setBlocked] = useState<BlockedUser[]>(MOCK_BLOCKED);

  // Notification toggles
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [newMsgAlert, setNewMsgAlert] = useState(true);
  const [replyAlert, setReplyAlert] = useState(true);

  // Privacy toggles
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [showOnline, setShowOnline] = useState(false);
  const [filterOffensive, setFilterOffensive] = useState(true);

  // Modals
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [blockListOpen, setBlockListOpen] = useState(false);
  const [changePassOpen, setChangePassOpen] = useState(false);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => router.replace("/"),
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all messages. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Forever",
          style: "destructive",
          onPress: () =>
            Alert.alert("Account Deleted", "Your account has been removed."),
        },
      ],
    );
  };

  const handleUnblock = (id: string) => {
    Alert.alert("Unblock", "Allow this sender to message you again?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Unblock",
        onPress: () => setBlocked((prev) => prev.filter((u) => u.id !== id)),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="dark" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile ── */}
        <SectionHeader title="Profile" />
        <Card>
          {/* Avatar + name display */}
          <TouchableOpacity
            style={styles.profileRow}
            onPress={() => setEditProfileOpen(true)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.profileAvatar,
                {
                  backgroundColor: profile.avatarColor + "22",
                  borderColor: profile.avatarColor + "55",
                },
              ]}
            >
              <Text
                style={[
                  styles.profileAvatarText,
                  { color: profile.avatarColor },
                ]}
              >
                {profile.avatarInitials}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileUsername}>@{profile.username}</Text>
              <Text style={styles.profileEmail}>{profile.email}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* ── Notifications ── */}
        <SectionHeader title="Notifications" />
        <Card>
          <SettingRow
            icon="🔔"
            label="Push Notifications"
            subtitle="Alerts on your device"
            right={
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: "#e2e8f0", true: "#0f172a" }}
                thumbColor="#ffffff"
              />
            }
          />
          <SettingRow
            icon="📧"
            label="Email Notifications"
            subtitle="Digest sent to your email"
            right={
              <Switch
                value={emailEnabled}
                onValueChange={setEmailEnabled}
                trackColor={{ false: "#e2e8f0", true: "#0f172a" }}
                thumbColor="#ffffff"
              />
            }
          />
          <SettingRow
            icon="💬"
            label="New Message Alerts"
            right={
              <Switch
                value={newMsgAlert}
                onValueChange={setNewMsgAlert}
                trackColor={{ false: "#e2e8f0", true: "#0f172a" }}
                thumbColor="#ffffff"
              />
            }
          />
          <SettingRow
            icon="↩️"
            label="Reply Alerts"
            noBorder
            right={
              <Switch
                value={replyAlert}
                onValueChange={setReplyAlert}
                trackColor={{ false: "#e2e8f0", true: "#0f172a" }}
                thumbColor="#ffffff"
              />
            }
          />
        </Card>

        {/* ── Privacy & Security ── */}
        <SectionHeader title="Privacy & Security" />
        <Card>
          <SettingRow
            icon="👤"
            label="Allow Anonymous Messages"
            subtitle="Let anyone send you messages"
            right={
              <Switch
                value={allowAnonymous}
                onValueChange={setAllowAnonymous}
                trackColor={{ false: "#e2e8f0", true: "#0f172a" }}
                thumbColor="#ffffff"
              />
            }
          />
          <SettingRow
            icon="🟢"
            label="Show Online Status"
            subtitle="Others can see when you're active"
            right={
              <Switch
                value={showOnline}
                onValueChange={setShowOnline}
                trackColor={{ false: "#e2e8f0", true: "#0f172a" }}
                thumbColor="#ffffff"
              />
            }
          />
          <SettingRow
            icon="🛡️"
            label="Filter Offensive Messages"
            subtitle="Auto-hide potentially harmful content"
            right={
              <Switch
                value={filterOffensive}
                onValueChange={setFilterOffensive}
                trackColor={{ false: "#e2e8f0", true: "#0f172a" }}
                thumbColor="#ffffff"
              />
            }
          />
          <SettingRow
            icon="🚫"
            label="Blocked Users"
            subtitle={`${blocked.length} blocked`}
            onPress={() => setBlockListOpen(true)}
          />
          <SettingRow
            icon="🔑"
            label="Change Password"
            noBorder
            onPress={() => setChangePassOpen(true)}
          />
        </Card>

        {/* ── Account ── */}
        <SectionHeader title="Account" />
        <Card>
          <SettingRow icon="📤" label="Log Out" onPress={handleLogout} />
          <SettingRow
            icon="🗑️"
            label="Delete Account"
            subtitle="Permanently remove all your data"
            danger
            noBorder
            onPress={handleDeleteAccount}
          />
        </Card>

        {/* Footer */}
        <Text style={styles.footer}>Version 1.0.0 · Anonymous Inbox</Text>
      </ScrollView>

      {/* Modals */}
      <EditProfileModal
        visible={editProfileOpen}
        profile={profile}
        onClose={() => setEditProfileOpen(false)}
        onSave={(p) => setProfile(p)}
      />
      <BlockListModal
        visible={blockListOpen}
        blocked={blocked}
        onClose={() => setBlockListOpen(false)}
        onUnblock={handleUnblock}
      />
      <ChangePasswordModal
        visible={changePassOpen}
        onClose={() => setChangePassOpen(false)}
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

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 48 },

  // Section header
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // Card
  card: {
    marginHorizontal: 16,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  // Profile row
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  profileUsername: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 1,
  },
  profileEmail: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 1,
  },

  // Setting row
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    gap: 12,
  },
  rowNoBorder: {
    borderBottomWidth: 0,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  rowIconText: { fontSize: 16 },
  rowContent: { flex: 1 },
  rowLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1e293b",
  },
  rowLabelDanger: {
    color: "#ef4444",
  },
  rowSubtitle: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 1,
  },
  rowRight: { flexShrink: 0 },
  chevron: {
    fontSize: 22,
    color: "#cbd5e1",
    fontWeight: "300",
  },

  // Footer
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#cbd5e1",
    marginTop: 32,
    marginBottom: 8,
  },

  // Modal shared
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

  // Inputs
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 6,
    marginTop: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#0f172a",
    backgroundColor: "#f8fafc",
    marginBottom: 2,
  },
  inputWithPrefix: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    paddingLeft: 12,
    marginBottom: 2,
  },
  inputPrefix: {
    fontSize: 15,
    color: "#94a3b8",
    marginRight: 2,
  },

  // Modal actions
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
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
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
  doneBtn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    alignItems: "center",
  },
  doneBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },

  // Block list
  blockedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  blockedName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  blockedDate: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
  unblockBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  unblockBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  emptyBlocked: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },
  emptyBlockedIcon: { fontSize: 36 },
  emptyBlockedText: {
    fontSize: 14,
    color: "#94a3b8",
  },
});
