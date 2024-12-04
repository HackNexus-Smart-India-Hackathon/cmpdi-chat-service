import { Schema, model, Document, Types } from "mongoose";
import User from "./user"; // Ensure this is the correct model
export enum chatType {
    PRIVATE = "PRIVATE",
    GROUP = "GROUP",
}

// Define the interface for a Chat document
export interface IChat extends Document {
    chatType: chatType;
    createdAt: Date;
    projectId: string;
    chat_members: Types.ObjectId[];
}

// Define the Chat schema
const ChatSchema = new Schema<IChat>({
    chatType: {
        type: String,
        enum: Object.values(chatType),
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now, // Use function reference
    },
    projectId: {
        type: String,
        validate: {
            validator: async function (value: string) {
                // Check if a project with the given projectId exists
                const projectExists = await User.exists({ projectId: value });
                return !!projectExists;
            },
            message: "Invalid project ID.",
        },
    },
    chat_members: {
        type: [Schema.Types.ObjectId],
        ref: "User",
        required: true,
    },
});

// Create and export the Chat model
const Chat = model<IChat>("Chat", ChatSchema);

export default Chat;
