import express, { Router } from "express";
import User, { IUser } from "../models/user"; // Ensure your user model is correctly imported
import Chat from "../models/chats"; // Ensure your chat model is correctly imported
import { chatType } from "../models/chats"; // Assuming you have a constant for chat types
import { NOTFOUND } from "../helper/getUserId";
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
      const { username, email, role, projectId } = req.body;

      // Check if the request body contains necessary data
      if (!username || !email || !role || !projectId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
      // Create new user
      const userData: IUser = {
        name: username,
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
        { new: true ,upsert : true} // Returns the updated document
      );
      
      if (!updatedChat) {
        // Check again if the chat exists to avoid duplicates
        const existingChat = await Chat.findOne({ projectId });
        if (!existingChat) {
          const newChat = new Chat({
            chatType: chatType.GROUP,
            createdAt: new Date(),
            projectId,
            chat_members: [savedUser._id],
          });
          await newChat.save();
      
          console.log("New chat created for projectId:", projectId);
        } else {
          console.log("Chat already created during another operation.");
        }
      }
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
      let chat = await Chat.find({ chat_members: user_id })
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

user.post('/addAdmin', async (req: express.Request, res: express.Response): Promise<any> => {

  const { email, username, role, projectId } = req.body
  if (!username || !email || !role || !projectId) {
    return res.status(500).json({ error: "Missing required fields" })
  }
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(500).json({ error: "Admin not found" })
    }
    const updatedChat = await Chat.findOneAndUpdate(
      { projectId },
      { $push: { chat_members: existingUser._id } },
      { new: true ,upsert: true} // Returns the updated document
    );
    
    if (!updatedChat) {
      // Check again if the chat exists to avoid duplicates
      const existingChat = await Chat.findOne({ projectId });
      if (!existingChat) {
        const newChat = new Chat({
          chatType: chatType.GROUP,
          createdAt: new Date(),
          projectId,
          chat_members: [existingUser._id],
        });
        await newChat.save();
    
        return res
          .status(201)
          .json({ message: "New admin chat created", user: existingUser });
      } else {
        console.log("Chat already created during another operation.");
      }
    }
    
    return res
      .status(201)
      .json({ message: "Admin added to chat", user: existingUser });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
})

export default user;