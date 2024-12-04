import { connection } from "websocket";
import { OutgoingMessage } from "./messages/outgoingMessages";
export type UserType = {
    id: string;
    name: string;
    websocket: connection;
};

export interface Room {
    users: UserType[];
}

export class UserManager {
    private users: Map<string, Room>;

    constructor() {
        this.users = new Map<string, Room>();
    }

    // Add a user to a specific room
    async addUser(name: string, userId: string, roomId: string, ws: connection) {
        let user: UserType = {
            id: userId,
            name,
            websocket: ws,
        };

        if (!this.users.get(roomId)) {
            this.users.set(roomId, {
                users: [],
            });
        }

        const room = this.users.get(roomId);
        room?.users.push(user);
    }

    // Retrieve a user from a specific room
    getUser(roomId: string, userId: string): UserType | null {
        const room = this.users.get(roomId);
        return room?.users.find(user => user.id === userId) || null;
    }

    // Broadcast a message to all users in a specific room
    async broadcastMessage(roomId: string, userId: string, userMessage: OutgoingMessage) {
        const user = this.getUser(roomId, userId);
        if (!user) {
            console.error("User not found");
            return;
        }

        const room = this.users.get(roomId);
        if (!room) {
            console.error("Room not found");
            return;
        }

        // Prepare the message to broadcast
        const message = {
            type: userMessage.type,
            payload: {
                roomId: roomId,
                message: userMessage.payload.message,
                name: user.name,
            },
        };

        // Broadcast the message to all users in the room
        room.users.forEach(({ websocket }) => {
            websocket.sendUTF(JSON.stringify(message));
        });
    }
}
