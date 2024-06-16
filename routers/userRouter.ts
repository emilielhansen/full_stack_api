import { Router } from "express";
import User from "../models/user";
import CreateUserDto from "../dto/createUserDto";
import { LoginUserDto } from "../dto/loginUserDto";
import { SessionData } from 'express-session';
import authMiddleware from '../middleware/authMiddleware';

const argon2 = require('argon2');

const userRouter = Router();
const router = Router();

// tests
userRouter.get('/protected', authMiddleware, (req, res) => {
  res.send('This is a protected route');
});

userRouter.get('/test', (req, res) => {
  res.send('Rute virker');
});

// Login
userRouter.post('/login', async (req, res) => {
  const { email, password } = req.body as LoginUserDto;
  console.log('Login attempt:', { email, password });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User found:', user);

    if (user.password === password) {
      // Store user ID in session
      (req.session as any).userId = user._id.toString();  
      console.log('Password match. User logged in:', user);
      return res.status(200).json(user);
    } else {
      console.log('Password does not match for user:', user);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ error: 'Error logging in' });
  }
});

// Logout
userRouter.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); // Slet session-cookien på klienten
    return res.status(200).json({ message: 'Logout successful' });
  });
});


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


    // 3. Verify password using Argon2
    //const passwordValid = await argon2.verify(user.password, password);

    //if (!passwordValid) {
      //return res.status(401).json({ message: "Invalid credentials" });
    //}

export default userRouter;