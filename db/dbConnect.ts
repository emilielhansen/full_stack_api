import mongoose from "mongoose";

export default () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error(error));
};