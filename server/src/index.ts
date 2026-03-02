import express from 'express'
import cors from "cors";
import { Server } from 'socket.io';
import http from "http";
import { authRouter } from './routes/auth.js';
import { userRouter } from './routes/user.js';
import { create } from 'domain';
import { prisma } from './lib/prisma.js';

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

io.on("connection", (socket) => {
  console.log("a user connected! ", socket.id);

  socket.on("disconnect", () => {
    console.log("a use disconnected ", socket.id);
  })

  socket.on("connect_error", (err) => {
    console.log("Error:", err.message);
  })

  socket.on("send_message", async (message) => {
    console.log(message);

    // 1. saved to DB
    const saved = await prisma.message.create({
      data: {
        id: message.id,
        text: message.text,
        senderKey: message.senderKey,
        reciverKey: message.reciverKey
      }
    })
    console.log("saved data",saved);
    

    // 2. Forward to receiver if online
    io.to(message.reciverKey).emit("receive_message", {
      ...saved,
      status: "delivered"
    })

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
})

server.listen(3000, "0.0.0.0", () => {
  console.log("Server is running on http://localhost:3000");
});