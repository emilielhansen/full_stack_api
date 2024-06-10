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

//Update husk det

userRouter.delete("/:userId", async (req, res) => {
  try {
    const removedUser = await User.deleteOne({ _id: req.params.userId });
    res.json(removedUser);
  } catch (error) {
    res.json({ message: error });
  }
});

export default userRouter;