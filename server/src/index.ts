import express from 'express'
import cors from "cors";
import { authRouter } from './routes/auth.js';
import { userRouter } from './routes/user.js';

const app = express()
app.use(cors())
app.use(express.json());

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/user", userRouter)


app.listen(3000, () => {
  console.log("Runtime DB URL:", process.env.DATABASE_URL);

  console.log('Server is running on http://localhost:3000')
})