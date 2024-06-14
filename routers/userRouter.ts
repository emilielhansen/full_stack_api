import { Router } from "express";
import User from "../models/user";
import CreateUserDto from "../dto/createUserDto";

const userRouter = Router();
const argon2 = require('argon2');

userRouter.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.json({ message: error });
  }
});

userRouter.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.json({ message: error });
  }
});

userRouter.post("/", async (req, res) => {
  console.log(req.body);
  const { username, fullname, email, password, image, createdAt } = req.body as CreateUserDto;

  try {
    // Hash the password
    const hashedPassword = await argon2.hash(password);

    // Create a new User instance with hashed password
    const user = new User({ 
      username: username, 
      fullname: fullname, 
      email: email, 
      password: hashedPassword, 
      image: image, 
      createdAt: createdAt
    });

    // Save the user to the database
    const savedUser = await user.save();
    
    res.json(savedUser);
  } catch (error) {
    res.status(500).json({ message: "Failed to create user", error: error });
  }
});
userRouter.post("/:userId", async (req, res) => {
  const { username, fullname, email, password, image, createdAt } = req.body as CreateUserDto;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { username, fullname, email, password, image, createdAt },
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