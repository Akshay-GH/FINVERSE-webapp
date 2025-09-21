import express from "express";
import { User, Account } from "../db/dbSchema.js";
import {
  userSchema,
  loginUserSchema,
} from "../zodSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;
import { authMiddleware } from "../gate/middleware.js";

const userRouter = express.Router();

userRouter.post("/signup", async (req, res) => {
  // Logic for user signup
  //user inputs
  const result = userSchema.safeParse(req.body);
  if (!result.success) {
    return res
      .status(400)
      .json({ message: "enter valid inputs ", error: result.error.errors });
  }
  const { username, password, firstName, lastName } = result.data;

  //puting data in db
  //checking user is already exist or not
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user


  try {
      let newUser = await User.create({
      username,
      password: hashedPassword,
      firstName,
      lastName,
    });

   await Account.create({
       userId:newUser._id,
       balance:Math.floor(Math.random()*10000)  // initial balance between 0 to 10000 rs
   });

   await newUser.save();
  } catch (err) {
    return res
      .status(500)
      .json({ error: "error while saving user to db", message: err.message });
  }

 
  res.status(201).json({ message: "User created successfully"});
});



userRouter.post("/login", async (req, res) => {
  // Logic for user login
  const result = loginUserSchema.safeParse(req.body);
  if (!result.success) {
    return res
      .status(400)
      .json({ message: "enter valid inputs ", error: result.error.errors });
  }
  const user = await User.findOne({ username: result.data.username });
  if (!user) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  const isPasswordValid = await bcrypt.compare(
    result.data.password,
    user.password
  );
  if (!isPasswordValid) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  if (user) {
    const token = jwt.sign({ userId: user._id ,firstName:user.firstName,lastName:user.lastName}, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.status(200).json({ message: "Login successful", token: "Bearer " + token });
    return;
  }

  res.status(411).json({
    message: "Error while logging in",
  });
});

userRouter.put("/", authMiddleware, async (req, res) => {
  const password = req.body.password;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;

  //.. i need to optionally update the data
  if (!password && !firstName && !lastName) {
    return res.status(400).json({ error: "please provide data to update" });
  }

  const userId = req.userId;

  const updateData = {};
  if (password) updateData.password = await bcrypt.hash(password, 10);
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;

  try {
    await User.findByIdAndUpdate(userId, updateData);
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error updating user", message: error.message });
  }
});


userRouter.get("/bulk", authMiddleware, async (req, res) => {
  const filter = req.query.filter || "";

  try {
    const users = await User.find({ $or: [
      { firstName: { $regex: filter, $options: "i" } },
      { lastName: { $regex: filter, $options: "i" } }
      
    ]});
    res.status(200).json(users.map(user=>{
        return {
            firstName:user.firstName,
            lastName:user.lastName,
            userId:user._id
        }
    }));
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching users", message: error.message });
  }
});

export default userRouter;
