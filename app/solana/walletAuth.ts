import {
    transact,
    Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import type {
    SolanaSignInInput,
    SolanaSignInOutput,
} from "@solana/wallet-standard-features";
import { verifySignIn } from "@solana/wallet-standard-util";
import { Buffer } from 'buffer';
import { APP_IDENTITY, SIGN_IN_PAYLOAD } from "./config";
import { stringToUint8Array } from "../utils";
import axios from "axios"

window.Buffer = Buffer;

async function connectWallet() {
    return await transact(async (wallet: Web3MobileWallet) => {
        try {
            console.log("before connect");
            const authorizationResult = await wallet.authorize({
                chain: 'solana:devnet',
                identity: APP_IDENTITY,
                // sign_in_payload: SIGN_IN_PAYLOAD
            });

            console.log("after connect");

            if (!authorizationResult.accounts[0].address) {
                throw new Error("no address returned from wallet")
            }

            return {
                address: authorizationResult.accounts[0].address
            };
        } catch (e: any) {
            console.log(e);
        }
    })
}
export async function checkUserExist() {
    try {
        const res = await connectWallet();
        if (!res?.address) {
            throw new Error("wallet doesn't retuned address");
        }
        const res2 = await axios.post("http://10.67.120.95:3000/api/v1/user/check", {
            "publicKey": res.address
        })
        console.log(res2.data);

    } catch (e) {
        console.log(e);
    }
}