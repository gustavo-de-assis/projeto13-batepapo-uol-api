import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import joi from "joi";
import dotenv from "dotenv";

const app = express();

dotenv.config();



app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

const userSchema = joi.object({
    name: joi.string().required(),
})

const messageSchema = joi.object({
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
    const participant = req.body;
    
    const validation = userSchema
    .validate(participant, { abortEarly: true });
    
    if(validation.error){
        res.sendStatus(422);
        return;
    }

    
    const signedUser = await db.collection("participants").findOne({nome: participant.nome});
    if(signedUser){
        console.log("Usuário já cadastrado!");
        res.status(409).send("User already exists");
        return;
    } 
   
    try {
        await db.collection("participants").insertOne(participant)
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
    const message = req.body;
    
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
