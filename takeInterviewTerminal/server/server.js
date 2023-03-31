const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
mongoose.set('strictQuery', true);
const router = require("./route.js");

mongoose.connect("mongodb://localhost:27017/results", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Database Connected..."));

app.use(express.json());
app.use(cors());
app.use(router);

app.listen(5050, () => console.log("Server running at port 5050..."));
