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

// export async function connectWallet() {
//     return transact(async (wallet: Web3MobileWallet) => {
//         const authorizationResult = await wallet.authorize({
//             cluster: "devnet",
//             identity: APP_IDENTITY,
//         });
//         console.log(authorizationResult);
//         return authorizationResult;
//     });
// }

const SIGN_IN_PAYLOAD = {
    domain: 'yourdomain.com',
    nonce: "12sjdb784",
    statement: 'Sign into React Native Sample App',
    uri: 'https://bits.app',
}

export async function signInNonce() {
    return transact(async (wallet: Web3MobileWallet) => {
        console.log("hi");
        
        const authorizationResult = await wallet.authorize({
            chain: 'solana:devnet',
            identity: APP_IDENTITY,
            sign_in_payload: SIGN_IN_PAYLOAD
        });
        console.log("sign in nonce result", authorizationResult);
        // const ouptput = {
        //      account: authorizationResult.accounts,
        //      signedMessage: authorizationResult.sign_in_result?.signed_message,
        //      signature: authorizationResult.sign_in_result?.signature,
        // }
        // const verifySIWSResult = verifySIWS(SIGN_IN_PAYLOAD,ouptput)
        return authorizationResult.sign_in_result;
    })
}


// function verifySIWS(
//     input: SolanaSignInInput,
//     output: SolanaSignInOutput
// ): boolean {
//     const serialisedOutput: SolanaSignInOutput = {
//         account: {
//             publicKey: new Uint8Array(output.account.publicKey),
//             ...output.account,
//         },
//         signature: new Uint8Array(output.signature),
//         signedMessage: new Uint8Array(output.signedMessage),
//     }
//     return verifySignIn(input, serialisedOutput);
// }