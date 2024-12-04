import express, { Express } from "express";
import * as mongoose from "mongoose"
// import {createClient} from "redis";
import cors from "cors"
import user from "./routes/user";
import message from "./routes/message";

const app : Express = express()

app.use(cors())

// let redisClient = createClient()
// redisClient.connect()
// .then(()=>{
//     console.log("connected to redis client")
// })
// .catch(()=>{
//     console.log("not able to connect")
// })

// async function publishNotificatiom(channel:RedisCommandArgument, notifciation:any) {
//     await redisClient.publish(channel , )
// }

mongoose.connect("mongodb+srv://kadevelopment2003:krishna@cluster0.miduc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(fullfilled =>{
    console.log("Connected to database")
})
.catch(err =>{
    console.log("Error in connecting")
})


app.use(express.json())

app.use(user);
app.use(message);


app.listen(8000 , ()=>{
    console.log("Listening to port 8000");
})
