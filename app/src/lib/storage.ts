import { createMMKV } from "react-native-mmkv";

export const storage = createMMKV();

// Helper functions for typed storage
export const mmkvStorage = {
    getItem: (key: string): string | null => {
        const value = storage.getString(key);
        return value ?? null;
    },

    setItem: (key: string, value: string): void => {
        storage.set(key, value);
    },

    removeItem: (key: string): void => {
        storage.remove(key);
    },
};

export const roomsCache = {
    save: (rooms: any[]) => {
        storage.set("rooms_cache", JSON.stringify(rooms));
    },

    load: (): any[] => {
        const raw = storage.getString("rooms_cache");
        return raw ? JSON.parse(raw) : [];
    },

    clear: () => {
        storage.remove("rooms_cache");
    }
};