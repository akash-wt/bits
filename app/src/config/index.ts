import { mmkvStorage } from "@/lib/storage";
import { Platform } from "react-native";

export const BACKEND_URL = Platform.OS === "android" ? "http://10.0.2.2:3000/api/v1" : "http://10.0.2.2:3000/api/v1";

export const APP_IDENTITY = {
    name: "Bits",
    uri: "https://bits.app",
    icon: "favicon.ico",
};

const raw = mmkvStorage.getItem("auth_user");
const authRaw = raw ? JSON.parse(raw) : null;
export const currentUser = authRaw?.publicKey ?? null;
