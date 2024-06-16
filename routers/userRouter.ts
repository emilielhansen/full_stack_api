import { Router } from "express";
import User from "../models/user";
import CreateUserDto from "../dto/createUserDto";

const argon2 = require('argon2');

const userRouter = Router();

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
  console.log('Request body:', req.body);
  const { username, fullname, email, password, image, createdAt } = req.body as CreateUserDto;

  try {
    // Hash the password using argon2
    const hashedPassword = await argon2.hash(password);

    // Create a new user with the hashed password
    const user = new User({ 
      username: username, 
      fullname: fullname, 
      email: email, 
      password: hashedPassword, 
      image: image, 
      createdAt: createdAt
    });

    const savedUser = await user.save();

    console.log('Saved user:', savedUser);
    res.json(savedUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: "User creation failed" });
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

userRouter.get("/", async (req, res) => {
  const { email, password } = req.body;
  console.log("Login credentials: ", req.body);

  try {
    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 2. Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Verify password using Argon2
    const passwordValid = await argon2.verify(user.password, password);

    if (!passwordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }


  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default userRouter;