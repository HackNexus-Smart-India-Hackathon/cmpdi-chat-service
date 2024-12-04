import z from "zod";
import User from "../models/user"
import Chat from "../models/chats";

export enum MessageType {
    Join_Room = "JOIN_ROOM",
    Send_Message = "SEND_MESSAGE"
}
// Define the types of incoming messages using discriminated unions
export type IncomingMessage = {
    type: MessageType.Join_Room,
    payload: InitMessageType
} |  {
    type: MessageType.Send_Message,
    payload: SendMessageType
} 

// Define the schema for "JOIN_ROOM" messages
const InitMessageType = z.object({
    name: z.string(),          // Room name
    userId: z.string().refine(async (userId) => {
        const userExists = await User.exists({ _id: userId }); // Ensure user exists
        return userExists;
    }, { message: "User not found" }),
    roomId: z.string().refine(async (roomId) => {
        const roomExists = await Chat.exists({ _id: roomId }); // Ensure room exists
        return roomExists;
    }, { message: "Room not found" }),
})

export type InitMessageType = z.infer<typeof InitMessageType>

// Define the schema for "SEND_MESSAGE" messages
const  SendMessageType  = z.object({
    userId: z.string().refine(async (userId) => {
        const userExists = await User.exists({ _id: userId }); // Ensure user exists
        return userExists;
    }, { message: "User not found" }),
    roomId: z.string().refine(async (roomId) => {
        const roomExists = await Chat.exists({ _id: roomId }); // Ensure chat room exists
        return roomExists;
    }, { message: "Room not found" }),
    message: z.string().min(1, { message: "Message cannot be empty" }),  // Message validation
})

export type SendMessageType = z.infer<typeof SendMessageType>