import { Schema, model, Document } from "mongoose";

export enum Roles {
    INVESTIGATOR = "INVESTIGATOR",
    ADMIN = "ADMIN",
}

// Define the IUser interface
export interface IUser extends Document {
    name: string;
    email: string;
    role: Roles;
    projectId: string;
}

// Define the User schema
const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
        trim: true, // Removes leading/trailing spaces
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensure unique emails
        trim: true,
    },
    role: {
        type: String,
        enum: Object.values(Roles),
        required: true,
    },
    projectId: {
        type: String,
        required: true,
        trim: true,
    },
});

// Create and export the User model
const User = model<IUser>("User", userSchema);

export default User;
