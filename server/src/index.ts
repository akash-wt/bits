import express from 'express'
import cors from "cors";
import { Server } from 'socket.io';
import http from "http";
import { authRouter } from './routes/auth.js';
import { userRouter } from './routes/user.js';
import { create } from 'domain';
import { prisma } from './lib/prisma.js';
import { da } from 'zod/locales';

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors())
app.use(express.json());

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/user", userRouter)

const onlineUsers = new Map<string, string>();

io.on("connection", (socket) => {
  console.log("a user connected! ", socket.id);

  //user register their key to connect
  socket.on("register", (pubKey: string) => {
    onlineUsers.set(pubKey, socket.id);
    console.log("registered", pubKey, socket.id);
  });

  socket.on("disconnect", () => {
    console.log("a use disconnected ", socket.id);

    onlineUsers.forEach((key) => {
      if (key === socket.id) {
        onlineUsers.delete(key)
      }
    })
  })

  socket.on("connect_error", (err) => {
    console.log("Error:", err.message);
  })

  socket.on("send_message", async (message) => {
    console.log(message);

    // 1. saved to DB
    const saved = await prisma.message.upsert({
      where: { id: message.id },
      update: {},
      create: {
        id: message.id,
        text: message.text,
        senderKey: message.senderKey,
        reciverKey: message.reciverKey
      }
    })

    console.log("saved data", saved);

    // 2. Forward to receiver if online
    const reciverSocketId = onlineUsers.get(message.reciverKey);
    if (reciverSocketId) {
      io.to(reciverSocketId).emit("receive_message", {
        ...saved,
        status: "delivered"
      })
    }

    // 3. Update status to DELIVERED in DB
    await prisma.message.update({
      where: { id: saved.id },
      data: { status: "DELIVERED" }
    });

    // 4. Confirm back to sender
    socket.emit("message_delivered", {
      messageId: saved.id,
      reciverKey: message.reciverKey
    });

  })

  socket.on("get_messages", async ({ senderKey, reciverKey }) => {
    // console.log("into get meassage");

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderKey, reciverKey },
          { senderKey: reciverKey, reciverKey: senderKey }
        ]
      },
      orderBy: { createdAt: "asc" }
    });

    socket.emit("message_history", messages);
  });

  socket.on("get_everything", async (userPubkey) => {
    const all_data = await prisma.message.findMany({
      where: {
        OR: [
          { senderKey: userPubkey },
          { reciverKey: userPubkey }
        ]
      },
      orderBy: { createdAt: "desc" } // latest first
    });

    const roomMap = new Map<string, typeof all_data[0]>();

    all_data.forEach((msg) => {
      const roomKey = msg.senderKey === userPubkey
        ? msg.reciverKey!
        : msg.senderKey;

      // since ordered by desc, first occurrence = latest message
      if (!roomMap.has(roomKey)) {
        roomMap.set(roomKey, msg);
      }
    });

    const result = Array.from(roomMap.entries()).map(([roomId, lastMsg]) => ({
      roomId,
      lastMessage: lastMsg
    }));

    socket.emit("all_talked_users", result);
  });
})

server.listen(3000, "0.0.0.0", () => {
  console.log("Server is running on http://localhost:3000");
});