import { Router } from "express";
import User from "../models/user";
import CreateUserDto from "../dto/createUserDto";

const userRouter = Router();

userRouter.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.json({ message: error });
  }
});

userRouter.post("/", async (req, res) => {
  console.log(req.body);
  const { username, fullname, email, password, image } = req.body as CreateUserDto;
  const user = new User({ username: username, fullname: fullname, email: email, password: password, image: image});

  try {
    const savedUser = await user.save();
    res.json(savedUser);
  } catch (error) {
    res.json({ message: error });
  }
});

userRouter.post("/:userId", async (req, res) => {
  const { username, fullname, email, password, image } = req.body as CreateUserDto;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { username, fullname, email, password, image },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    res.json({ message: error });
  }
});

userRouter.delete("/:userId", async (req, res) => {
  try {
    const removedUser = await User.deleteOne({ _id: req.params.userId });
    res.json(removedUser);
  } catch (error) {
    res.json({ message: error });
  }
});

export default userRouter;