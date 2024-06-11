import { Router } from "express";
import Post from "../../full_stack_api/models/post";
import CreatePostDto from "../../full_stack_api/dto/createPostDto";

const postRouter = Router();

postRouter.get("/", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.json({ message: error });
  }
});

postRouter.post("/", async (req, res) => {
  const { user, content } = req.body as CreatePostDto;
  const post = new Post({ user: user, content: content });

  try {
    const savedPost = await post.save();
    res.json(savedPost);
  } catch (error) {
    res.json({ message: error });
  }
});

//Update her tak:)
postRouter.post("/:postId", async (req, res) => {
  const { user, content } = req.body as CreatePostDto;

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      { user, content },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(updatedPost);
  } catch (error) {
    res.json({ message: error });
  }
});

postRouter.delete("/:postId", async (req, res) => {
  try {
    const removedPost = await Post.deleteOne({ _id: req.params.postId });
    res.json(removedPost);
  } catch (error) {
    res.json({ message: error });
  }
});

export default postRouter;