import { connection, server} from "websocket";
import http from "http"
import { IncomingMessage, MessageType } from "./messages/incomingMessages";
import { UserManager } from "./UserManager";
import * as mongoose from "mongoose"
import { OutgoingMessage, SupportedMessageOutgoing } from "./messages/outgoingMessages";

const userManager : UserManager  = new UserManager()


mongoose.connect("mongodb+srv://kadevelopment2003:krishna@cluster0.miduc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(fullfilled =>{
    console.log("Connected to database")
})
.catch(err =>{
    console.log("Error in connecting")
})


var httpServer : http.Server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
    }
);
httpServer.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

let wsServer = new server({
    httpServer,
    autoAcceptConnections: false
});

wsServer.on('request', function(request) {
    var ws:connection = request.accept();
    console.log((new Date()) + ' Connection accepted.');
    ws.on('message', function(message : any) {
        if (message.type === 'utf8') {
           messageHandler(JSON.parse(message.utf8Data) ,ws)
        }
    });
    ws.on('close', function(reasonCode:any, description:any) {
        console.log((new Date()) + ' Peer ' + ws.remoteAddress + ' disconnected.');
    });
});

function messageHandler(message : IncomingMessage , ws : connection ){
    if (message.type === MessageType.Join_Room) {
        const payload = message.payload
        userManager.addUser(payload.name, payload.userId , payload.roomId ,ws)  
        
    }
    if (message.type === MessageType.Send_Message) {
        const payload = message.payload
        const user = userManager.getUser(payload.roomId , payload.userId)
        if (!user) {
            console.error("User not found in the room")
            return;
        }
        // ? brodcast logic
        const outgoingMessage : OutgoingMessage = {
            type : SupportedMessageOutgoing.AddChat,
            payload: {
                roomId : payload.roomId,
                message : payload.message,
                name: user.name,
            }
        }
        userManager.broadcastMessage(payload.roomId , payload.userId,  outgoingMessage)

    }
}
