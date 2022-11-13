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

app.get("/participants", (req, res) => {
    db.collection("participants")
    .find()
    .toArray()
    .then((participants) =>{
        res.send(participants).status(200)
        }
    )
    .catch((err)=>{
        res.sendStatus(500);
        }
    )
})
app.post("/participants", (req, res) => {

})
app.get("/messages", (req, res) => {

})
app.post("/messages", (req, res) => {

})
app.post("/status", (req, res) => {

})
app.listen(5000);
