import { Router } from "express";
import { VerifySchema } from "../types/auth.js";
import nacl from "tweetnacl";
import { Buffer } from "buffer";
import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config.js";
import crypto from "crypto";
import { PublicKey } from "@solana/web3.js";

const router = Router()

router.post("/verify/nonce", async (req, res) => {
    try {

        const parseBody = VerifySchema.safeParse(req.body);
        if (!parseBody.success) {
            return res.status(400).json({ msg: "Incorrect inputs" });
        }
        console.log(parseBody.data);
        const { publicKey, signedMessage, signature } = parseBody.data;

        const publicKeyBytes = new PublicKey(publicKey).toBytes();
        const messageBytes = new TextEncoder().encode(signedMessage);
        const signatureBytes = Buffer.from(signature, "base64");

        const verified = nacl.sign.detached.verify(
            messageBytes,
            signatureBytes,
            publicKeyBytes
        );

        console.log("verified:  ", verified);

        if (!verified) {
            return res.status(401).json({ msg: "Invalid signature" });
        }

        // find the user and validate the nonce contained in the signed message

        const user = await prisma.user.findUnique({ where: { pubKey: publicKey } });
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // issue JWT

        const token = jwt.sign(
            { id: user.id, pubKey: user.pubKey },
            JWT_PASSWORD,
            { expiresIn: "30d" }
        );

        // rotate nonce to prevent replay
        const newNonce = crypto.randomUUID();

        await prisma.user.update({ where: { id: user.id }, data: { nonce: newNonce } });

        return res.json({ verified: true, token, user: { id: user.id, pubKey: user.pubKey, name: user.name } });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ msg: "Server error" });
    }

})

export default router;
export const authRouter = router;