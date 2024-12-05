import express, { Router } from "express";
import User, { IUser } from "../models/user"; // Ensure your user model is correctly imported
import Chat from "../models/chats"; // Ensure your chat model is correctly imported
import { chatType } from "../models/chats"; // Assuming you have a constant for chat types
import {NOTFOUND } from "../helper/getUserId";

const user: Router = express.Router();


user.post(
  "/userDetails",
  async (req: express.Request, res: express.Response): Promise<any> => {
    let { email } = req.body;
    if (!email) return res.status(400).json({ error: "please add email" });
    try {
      let user = await User.findOne({ email });
      if (!user) return res.status(400).json({ error: NOTFOUND });

      return res.status(201).json({ user });
    } catch (error) {
      console.error(error);
      return res.status(404).json({ error: "Internal Server Error" });
    }
  }
);

user.post(
  "/createUser",
  async (req: express.Request, res: express.Response): Promise<any> => {
    try {
      console.log(req.body);
      const { name, email, role, projectId } = req.body;

      // Check if the request body contains necessary data
      if (!name || !email || !role || !projectId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Create new user
      const userData: IUser = {
        name,
        email,
        role,
        projectId,
      } as IUser;

      const newUser = new User(userData);
      const savedUser = await newUser.save();

      // Add user to chat members or create a new chat
      const updatedChat = await Chat.findOneAndUpdate(
        { projectId },
        { $push: { chat_members: savedUser._id } },
        { new: true } // Returns the updated document
      );
      // let chat_details : chatDetails;
      if (!updatedChat) {
        // If no chat exists, create a new one
        const newChat = new Chat({
          chatType: chatType.GROUP,
          createdAt: new Date(),
          projectId,
          chat_members: [savedUser._id],
        });
        await newChat.save();
      }
      return res
        .status(201)
        .json({ message: "User created successfully", user: savedUser });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

user.post(
  "/privateChat",
  async (req: express.Request, res: express.Response): Promise<any> => {
    try {
      const { name, email, role, projectId, to } = req.body;

      // Check if the request body contains necessary data
      if (!name || !email || !role || !projectId || !to) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return res.status(400).json({ error: "Sender not found" });
      }

      // Check if recipient user exists
      const recipientUser = await User.findOne({ email: to });
      if (!recipientUser) {
        return res.status(404).json({ error: "Recipient user not found" });
      }

      const newChat = new Chat({
        chatType: chatType.PRIVATE,
        createdAt: new Date(),
        projectId,
        chat_members: [existingUser._id, recipientUser._id],
      });

      const savedChat = await newChat.save();

      return res.status(201).json({
        message: "private chat established",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

user.post(
  "/chats",
  async (req: express.Request, res: express.Response): Promise<any> => {
    try {
        const { user_id } = req.body;

        // Validate query parameters
        if (!user_id) {
            return res.status(400).json({ error: "User_id required" });
        }
        let chat = await Chat.find({chat_members : user_id})
        if (!chat) {
            return res.status(404).json({ error: "Chat not found." });
        }

        return res.status(200).json({ chat });
    } catch (error) {
      console.error("Error in /chatId route:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default user;
