import express from "express";
import dbConnect from "./db/dbConnect";
import "dotenv/config";
import userRouter from "./routers/userRouter";
import cors from "cors";
import postRouter from "./routers/postRouter";

dbConnect();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/users", userRouter);
app.use("/posts", postRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});