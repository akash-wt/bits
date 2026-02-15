import { Router } from "express";
import crypto from "crypto";
import { UserSchema } from "../types/user.js";
import { prisma } from "../lib/prisma.js";
const router = Router()

router.post("/check", async (req, res) => {
    try {
        const nonce = crypto.randomUUID().toString();
        const parseBody = UserSchema.safeParse(req.body);
        if (!parseBody.success) {
            return res.status(400).json({ msg: "Incorrect inputs" });
        }

        const { publicKey, name } = parseBody.data;

        const userExist = await prisma.user.findUnique({
            where: {
                pubKey: publicKey
            }
        })

        if (!userExist?.id || !userExist.pubKey) {
            await prisma.user.create({
                data: {
                    pubKey: publicKey,
                    nonce
                }
            })
        }

        const updateUser = prisma.user.update({
            where: {
                id: userExist?.id!
            },
            data: {
                nonce
            }
        })

        res.json({ nonce, userExist });
    } catch (e: any) {
        console.log(e);
        throw new Error("user/nonce failed", e)
    }
})

export const userRouter = router;