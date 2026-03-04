import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { mmkvStorage } from "../lib/storage";
import { currentUser } from "@/config";

export interface ChatMessage {
  id: string;
  text: string;
  senderKey: string;
  reciverKey: string;
  createdAt: number; // store as timestamp
  status: MessageStatus
}
export type MessageStatus = "sent" | "delivered" | "read";

interface ChatRoomState {
  messages: ChatMessage[];
  unreadCount: number;
}

interface ChatStore {
  chats: Record<string, ChatRoomState>;
  addMessage: (reciverKey: string, message: ChatMessage) => void;
  //   markMessageAsRead: (roomId: string, messageId: string) => void;
  markRoomAsRead: (roomId: string) => void;
  clearRoom: (reciverKey: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist((set, get) => ({
    chats: {},

    addMessage: (reciverKey, message) =>
      set((state) => {
        const room = state.chats[reciverKey] ?? {
          messages: [],
          unreadCount: 0,
        };

        const alreadyExists = room.messages.some((m) => m.id === message.id);
        if (alreadyExists) return state;

        const isIncoming =
          message.status !== "read" &&
          message.senderKey !== currentUser;

        return {
          chats: {
            ...state.chats,
            [reciverKey]: {
              messages: [...room.messages, message],
              unreadCount: isIncoming
                ? room.unreadCount + 1
                : room.unreadCount,
            },
          },
        };
      }),

    //   markMessageAsRead: (roomId, messageId) =>
    //     set((state) => {
    //       const room = state.chats[roomId];
    //       if (!room) return state;

    //       let unreadReduced = 0;

    //       const updated = room.messages.map((msg) => {
    //         if (msg.id === messageId && msg.status !== "read") {
    //           unreadReduced++;
    //           return { ...msg, status: "read" };
    //         }
    //         return msg;
    //       });

    //       return {
    //         chats: {
    //           ...state.chats,
    //           [roomId]: {
    //             messages: updated,
    //             unreadCount: Math.max(
    //               room.unreadCount - unreadReduced,
    //               0
    //             ),
    //           },
    //         },
    //       };
    //     }),

    markRoomAsRead: (roomId) =>
      set((state) => {
        const room = state.chats[roomId];
        if (!room) return state;

        const updatedMessages = room.messages.map((msg) =>
          msg.status !== "read"
            ? { ...msg, status: "read" as MessageStatus }
            : msg
        );

        return {
          chats: {
            ...state.chats,
            [roomId]: {
              messages: updatedMessages,
              unreadCount: 0,
            },
          },
        };
      }),

    clearRoom: (reciverKey) =>
      set((state) => {
        const updated = { ...state.chats };
        delete updated[reciverKey];
        return { chats: updated };
      }),

  }), {
    name: "chat-storage",
    storage: createJSONStorage(() => mmkvStorage)
  })

);

