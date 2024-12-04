import express, { Request, Response } from "express";
import  Message  from "../models/message"; // Adjust the import path based on your project structure
import User from "../models/user";

const message = express.Router();

// POST route to add a new message
message.post("/addMessage", async (req: Request, res: Response) :Promise<any>=> {
    try {
        // Destructure the data from the request body
        const { chat_id, content, created_by } = req.body;

        // Validate required fields
        if (!chat_id || !content || !created_by) {
            return res.status(400).json({ error: "chat_id, content, and created_by are required." });
        }

        // Optional: Validate that the user exists before creating the message (you can remove if unnecessary)
        const user = await User.findById(created_by);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Create a new message
        const newMessage = new Message({
            chat_id,
            content,
            created_by,
        });

        // Save the message to the database
        const savedMessage = await newMessage.save();

        // Return the saved message as the response
        return res.status(201).json({ message: "Message created successfully.", data: savedMessage });
    } catch (error) {
        console.error("Error creating message:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

message.get('/getPrevChat' , async (req : express.Request , res : express.Response) :Promise<any>=>{
    const {chat_id} = req.body;
    if(!chat_id)
        res.status(400).json({ error: "chat_id  required." });
    try{
        const messages = await Message.find({chat_id})
        if(messages) {
            return res.status(201).json({message : "message content"  ,data : messages})
        }
    }
    catch(error){
        console.error("Error creating message:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
})

export default message;
