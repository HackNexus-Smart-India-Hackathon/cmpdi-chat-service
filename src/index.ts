import express, { Express } from "express";
import * as mongoose from "mongoose"
// import {createClient} from "redis";
import cors from "cors"
import user from "./routes/user";
import message from "./routes/message";
import { MONGO_URI } from "./config";


const app : Express = express()

app.use(cors())

mongoose.connect(MONGO_URI  )
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
