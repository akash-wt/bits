import {
    transact,
    Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import type {
    SolanaSignInInput,
    SolanaSignInOutput,
} from "@solana/wallet-standard-features";
import { verifySignIn } from "@solana/wallet-standard-util";

export const APP_IDENTITY = {
    name: "Bits",
    uri: "https://bits.app",
    icon: "favicon.ico",
};
import { Buffer } from 'buffer';

window.Buffer = Buffer;

export async function connectWallet() {
    return transact(async (wallet: Web3MobileWallet) => {
        const authorizationResult = await wallet.authorize({
            cluster: "devnet",
            identity: APP_IDENTITY,
        });
        console.log(authorizationResult.accounts[0].address);
        return authorizationResult;
    });
}

const SIGN_IN_PAYLOAD = {
    domain: 'bits.app',
    nonce: "12sjdb784",
    statement: 'Sign into Bits App to verfiy yourself',
    uri: 'https://bits.app',
}

function stringToUint8Arry(msg: string): Uint8Array {
    const buffer = Buffer.from(msg, 'base64');
    const uint8array = new Uint8Array(buffer);
    console.log(uint8array);
    return uint8array;
}

export async function signInNonce() {
    return transact(async (wallet: Web3MobileWallet) => {
        try {
            const authorizationResult = await wallet.authorize({
                chain: 'solana:devnet',
                identity: APP_IDENTITY,
                sign_in_payload: SIGN_IN_PAYLOAD
            });

            if (!authorizationResult.sign_in_result) {
                throw new Error("no sign_in_result returned from wallet")
            }
            console.log("before SIGN_IN_OUTPUT parse ");

            const SIGN_IN_OUTPUT: SolanaSignInOutput = {
                account: {
                    address: authorizationResult.accounts[0].address,
                    publicKey: Object.freeze(stringToUint8Arry(authorizationResult.accounts[0].address)),
                    chains: ["solana:devnet"],
                    features: ["solana:signIn"]

                },
                signedMessage: stringToUint8Arry(authorizationResult.sign_in_result?.signed_message),
                signature: stringToUint8Arry(authorizationResult.sign_in_result?.signature),
            }
            console.log("after SIGN_IN_OUTPUT parse ");

            const verifySIWSResult = verifySIWS(SIGN_IN_PAYLOAD, SIGN_IN_OUTPUT)
            console.log(verifySIWSResult);

            return {
                // signIn: authorizationResult.sign_in_result,
                verfied: verifySIWSResult
            };
        } catch (e: any) {
            console.log(e);
        }
    })
}


function verifySIWS(
    input: SolanaSignInInput,
    output: SolanaSignInOutput
): boolean {
    const serialisedOutput: SolanaSignInOutput = {
        account: {
            ...output.account,
            publicKey: new Uint8Array(output.account.publicKey),
        },
        signature: new Uint8Array(output.signature),
        signedMessage: new Uint8Array(output.signedMessage),
    }
    return verifySignIn(input, serialisedOutput);
}