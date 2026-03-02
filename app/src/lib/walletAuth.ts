import {
    transact,
    Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import axios from "axios"
import { APP_IDENTITY, BACKEND_URL } from "../config";
import { mmkvStorage } from "@/lib/storage";
// import * as BufferModule from "buffer"
// window.Buffer = BufferModule.Buffer;

async function connectWallet() {
    return await transact(async (wallet: Web3MobileWallet) => {
        try {
            const authorizationResult = await wallet.authorize({
                chain: 'solana:devnet',
                identity: APP_IDENTITY,
            });
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

export async function signNonceMessage(nonce: string, address: string) {
    return await transact(async (wallet: Web3MobileWallet) => {
        try {

            const authorizationResult = await wallet.authorize({
                chain: 'solana:devnet',
                identity: APP_IDENTITY,
            });

            const message = `Please sign this message to verify your identity. Nonce: ${nonce}`;

            const messageBuffer = new Uint8Array(
                message.split('').map(c => c.charCodeAt(0)),
            );

            const signedMessages = await wallet.signMessages({
                addresses: [address],
                payloads: [messageBuffer]
            })

            return signedMessages;

        } catch (e: any) {
            console.log("Error ", e);
        }
    })

}

export async function checkUserExist() {
    try {

        // 1. For checking if user exist or not if yes we get nonce if not we create user then send nonce.
        const connectWalletresponse = await connectWallet();

        if (!connectWalletresponse?.address) {
            throw new Error("wallet doesn't retuned address");
        }

        // 2. nonce from server. 
        const nonceResponse = await axios.post(`${BACKEND_URL}/user/check`, {
            "publicKey": connectWalletresponse.address
        })

        const message = `Please sign this message to verify your identity. Nonce: ${nonceResponse.data.nonce}`;

        if (nonceResponse.data.userExist.pubKey !== connectWalletresponse.address) {
            throw new Error("Wallet public key mismatch!");
        }
        // 3. Signed nonce with wallet.
        const signedMessages = await signNonceMessage(nonceResponse.data.nonce, connectWalletresponse.address);

        if (!signedMessages) {
            throw new Error("Nonce sign failed!")
        }
        // 4. verifying nonce...  if true issue JWT

        const signatureBase64 = Buffer.from(signedMessages[0]).toString("base64")

        const JWTResponse = await axios.post(`${BACKEND_URL}/auth/verify/nonce`, {
            publicKey: connectWalletresponse.address,
            signature: signatureBase64,
            signedMessage: message

        }
        )

        mmkvStorage.setItem("auth_user", JSON.stringify({
            publicKey: connectWalletresponse.address,
            jwt: JWTResponse.data.token,
        }))
        return JWTResponse;


    } catch (e) {
        console.log("error ", e);
    }
}