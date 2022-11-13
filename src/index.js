import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import joi from "joi";

const app = express();
app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient("mongodb://localhost:27017");
let db;


mongoClient
    .connect()
    .then(() => {
        db = mongoClient.db("batepapo_uol")
    })
    .catch((err) => { console.log(err) });


app.get("/participants", async (req, res) => {
    try {
        const participants = await db.collection.find().toArray()
        res.send(part).status(200);
    }
    catch (err) {
        res.sendStatus(500)
    }
})
app.post("/participants", (req, res) => {

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
    try {
        const message = req.body;
        await db.collection("messages").insertOne(message)
        res.status(201).send("Success! Msg sent!")
    }
    catch(err) {
        res.status(500).send("Error! Couldn't send message!")
    }
})
app.post("/status", (req, res) => {

})
app.listen(5000);
