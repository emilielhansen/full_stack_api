import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },

});

export default mongoose.model("posts", PostSchema);// posts collection in MongoDB