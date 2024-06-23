import { Router } from "express";
import User from "../models/user";
import CreateUserDto from "../dto/createUserDto";
import { LoginUserDto } from "../dto/loginUserDto";
import { SessionData } from 'express-session';
import authMiddleware from '../middleware/authMiddleware';
import { v4 as uuidv4 } from 'uuid';

//hashing
const argon2 = require('argon2');

const userRouter = Router();

//indsat fra session.d.ts - for at kunne gemme i session
declare module 'express-session' {
  interface SessionData {
      userId: string;
      sessionToken: string;
  }
}

// Test på protected route
userRouter.get('/protected', authMiddleware, (req, res) => {
  res.send('This is a protected route');
});

// test route
userRouter.get('/test', (req, res) => {
  res.send('Rute virker');
});

// Login route
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
    const passwordMatch = await argon2.verify(user.password, password);

    if (passwordMatch) {
      // Gem user ID i session
      (req.session as any).userId = user._id.toString();  
      // Generer sessionToken
      const sessionToken = uuidv4();
      user.sessionToken = sessionToken;
      await user.save();

      // Gem sessionToken og userID i sessionen
      req.session.userId = user._id.toString();
      req.session.sessionToken = sessionToken;

      // Sæt sessionToken som cookie
      res.cookie('session_token', sessionToken, {
        expires: new Date(Date.now() + 1800000), // 30 min expiration
        httpOnly: false, // Beskyt mod XSS - sæt til true
        secure: false, // Set til true hvis vi bruger HTTPS
        sameSite: 'strict' // Beskyt mod CSRF
    });

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

// Logout route
userRouter.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); // Slet session-cookien
    res.clearCookie('session_token');
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

//Signup route
userRouter.post("/", async (req, res) => {
  console.log('Request body:', req.body);
  const { username, fullname, email, password, createdAt } = req.body as CreateUserDto;

  try {

    const hashedPassword = await argon2.hash(password);

    // Create a new user with the hashed password
    const user = new User({ 
      username: username, 
      fullname: fullname, 
      email: email, 
      password: hashedPassword,
      createdAt: createdAt
    });

    // gemmer dataen i databasen
    const savedUser = await user.save();

    console.log('Saved user:', savedUser);
    res.json(savedUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: "User creation failed" });
  }
});

userRouter.post("/:userId", async (req, res) => {
  const { fullname } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { fullname },
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

// Endpoint to get current user
userRouter.get('/current', async (req, res) => {
  if (!req.params) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const user = await User.findById(req.params);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


export default userRouter;
