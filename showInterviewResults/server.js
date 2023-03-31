import express from "express";
import mongoose from "mongoose";
import cors from "cors";
const app = express();
mongoose.set('strictQuery', true);


const getData = async (req, res) => {
    try {
        const data = await Data.find();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const getDataById = async (req, res) => {
    try {
        const data = await Data.findById(req.params.id);
        res.json(data);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};
const saveData = async (req, res) => {
    const data = new Data(req.body);
    try {
        const inserteddata = await data.save();
        res.status(201).json(inserteddata);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
const updateData = async (req, res) => {
    try {
        const updateddata = await Data.updateOne({ _id: req.params.id }, { $set: req.body });
        res.status(200).json(updateddata);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
const deleteData = async (req, res) => {
    try {
        const deleteddata = await Data.deleteOne({ _id: req.params.id });
        res.status(200).json(deleteddata);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


const router = express.Router();
router.get('/', (req, res) => { res.redirect('/data'); });
router.get('/data', getData);
router.get('/data/:id', getDataById);
router.post('/data', saveData);
router.put('/data/:id', updateData);
router.delete('/data/:id', deleteData);


const Data = mongoose.model('results', new mongoose.Schema({
    "studentName": { "type": "String" },
    "Login ID": { "type": "Number" },
    "Password": { "type": "String" },
    "topic": { "type": "String" },
    "questions": {
        "question1": {
            "question": { "type": "String" },
            "studentAns": { "type": "String" },
            "rating": { "type": "Number" }
        },
        "question2": {
            "question": { "type": "String" },
            "studentAns": { "type": "String" },
            "rating": { "type": "Number" }
        },
        "question3": {
            "question": { "type": "String" },
            "studentAns": { "type": "String" },
            "rating": { "type": "Number" }
        },
        "question4": {
            "question": { "type": "String" },
            "studentAns": { "type": "String" },
            "rating": { "type": "Number" }
        },
        "question5": {
            "question": { "type": "String" },
            "studentAns": { "type": "String" },
            "rating": { "type": "Number" }
        }
    },
    "rating": { "type": "Number" }
}));


mongoose.connect("mongodb+srv://adithya:adithya3403@cluster0.krmnoey.mongodb.net/interview", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Database Connected...");
}).catch((error) => {
    console.log("Error connecting to database:", error);
});
app.use(express.json());
app.use(cors());
app.use(router);
app.listen(5050, () => console.log("Server running at port 5050..."));