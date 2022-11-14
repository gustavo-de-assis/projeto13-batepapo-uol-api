import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import joi from "joi";
import dotenv from "dotenv";

import dayjs from "dayjs";

const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
let loggedUser;

const userSchema = joi.object({
    name: joi.string().required(),
    lastStatus: joi.date().required()
})

const messageSchema = joi.object({
   // from: joi.string().required(),
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.string().valid('message','private_message').required(),
    //time: joi.date().required()
})

mongoClient
    .connect()
    .then(() => {
        db = mongoClient.db("batepapo_uol")
    })
    .catch((err) => { console.log(err) });


app.get("/participants", async (req, res) => {
    try {
        const participants = await db.collection("participants").find().toArray()
        res.send(participants).status(200);
    }
    catch (err) {
        res.sendStatus(500)
    }
})

app.post("/participants", async (req, res) => {
    //const participant = {...req.body, lastStatus: Date.now()};
    loggedUser = {...req.body, lastStatus: Date.now()};
    
    const validation = userSchema
    .validate(loggedUser, { abortEarly: true });
    
    if(validation.error){
        res.sendStatus(422);
        return;
    }

    
    const signedUser = await db.collection("participants").findOne({name: loggedUser.name});
    if(signedUser){
        console.log("Usuário já cadastrado!");
        res.status(409).send("User already exists");
        return;
    } 
   
    try {
        const statusMessage = {
            from: loggedUser.name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: dayjs().format('HH:mm:ss')
        }

        await db.collection("participants").insertOne(loggedUser)
        await db.collection("messages").insertOne(statusMessage)
        res.status(201).send("Created!")
    }
    catch(err) {
        res.status(500).send("Error! Couldn't create User!")
    }
})

app.get("/messages", async (req, res) => {
    const { limit } = req.query;
    const { user }  = req.headers;

    try {
        
        const messages = await db.collection("messages").find().toArray()
        
        messages = {...messages.filter((msg)=> {
            msg.from === user || 
            msg.to === user || 
            msg.type === 'message' ||
            msg.type === 'status'
        })}


        if(limit >= 1){
            res.send(messages.filter((message, i) => i <= limit)).status(200)
        }else{
            res.send(messages).status(200)
        }

    }
    catch (err) {
        res.send("Bad request").status(500)
    }
})

app.post("/messages", async (req, res) => {

    const { user } = req.headers;

    if(user !== loggedUser.name){
        res.status(404).send("User not found!");
        return;
    }

    
    const validation = messageSchema.validate(req.body, { abortEarly: true });
    
    if(validation.error){
        res.sendStatus(422);
        return;
    }
    
    const message = {...req.body, from: user, time: dayjs().format("HH:mm:ss")};
    console.log(message);
    
    try {
        await db.collection("messages").insertOne(message)
        res.status(201).send("Success! Msg sent!")
    }
    catch(err) {
        res.status(500).send("Error! Couldn't send message!")
    }
})

app.post("/status", (req, res) => {

})



app.listen(5000, ()=>{console.log("Server running at port 5000")});
