import express from "express";
import dbConnect from "./db/dbConnect";
import "dotenv/config";
import userRouter from "./routers/userRouter";
import cors from "cors";
import postRouter from "./routers/postRouter";
import bodyParser from 'body-parser';
import sessionLogger from './middleware/sessionLogger';

const session = require('express-session');

dbConnect();

const app = express();
app.use(bodyParser.json());

// Ændre til http://localhost:5173 hvis lokalt
app.use(cors({
  origin: process.env.APP_URL,
  credentials: true,
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 3600000 // Ensures cookies are sent with cross-site requests
  }
}));

app.use(sessionLogger);

app.use("/users", userRouter);
app.use("/posts", postRouter);


app.listen(process.env.API_PORT, () => {
  console.log("Server is running on port `$API_PORT`");
});
