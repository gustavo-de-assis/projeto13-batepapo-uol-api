import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import joi from "joi";
import dotenv from "dotenv";

import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import utc from 'dayjs/plugin/utc.js';


const app = express();

dotenv.config();

dayjs.extend(utc)
dayjs.extend(customParseFormat);
dayjs().format();

app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

const userSchema = joi.object({
    name: joi.string().required(),
    lastStatus: joi.date().required()
})

const messageSchema = joi.object({
    from: joi.string().required(),
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.string().valid('message','private_message').required()
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
    const participant = {...req.body, lastStatus: Date.now()};
    
    const validation = userSchema
    .validate(participant, { abortEarly: true });
    
    if(validation.error){
        res.sendStatus(422);
        return;
    }

    
    const signedUser = await db.collection("participants").findOne({name: participant.name});
    if(signedUser){
        console.log("Usuário já cadastrado!");
        res.status(409).send("User already exists");
        return;
    } 
   
    try {
        const statusMessage = {
            from: participant.name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: dayjs('1970-00-00', 'HH:MM:SS')
        }

        await db.collection("participants").insertOne(participant)
        await db.collection("messages").insertOne(statusMessage)
        res.status(201).send("Created!")
    }
    catch(err) {
        res.status(500).send("Error! Couldn't create User!")
    }
})

app.get("/messages", async (req, res) => {
    try {
        const messages = await db.collection("messages").find().toArray()
        res.send(messages).status(200)

    }
    catch (err) {
        res.sendStatus(500)
    }
})

app.post("/messages", async (req, res) => {
    const message = {... req.body, from: ""};
    
    const validation = messageSchema.validate(message, { abortEarly: true });
    
    if(validation.error){
        res.sendStatus(422);
        return;
    }
    
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
