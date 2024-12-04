import { Document, Schema, model, Types } from "mongoose";

// Define the IMessage interface
export interface IMessage extends Document {
    chat_id: Types.ObjectId; 
    content: string; 
    created_at: Date; 
    created_by: Types.ObjectId;
}

// Define the schema
const messageSchema = new Schema<IMessage>({
    chat_id: {
        type: Schema.Types.ObjectId,
        ref: "Chat",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now, // Use the function reference
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});

// Export the Message model
const Message = model<IMessage>("Message", messageSchema);

export default Message
