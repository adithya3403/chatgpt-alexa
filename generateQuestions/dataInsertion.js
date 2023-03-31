const mongoose = require('mongoose');
const Data = require('./dataModel.js');

const dotenv = require('dotenv');
dotenv.config();

mongoose.set('strictQuery', true);

// connect to database
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        // Exit process with failure
        process.exit(1);
    }
}

async function insertData(jsonData) {
    try {
        await Data.insertMany(jsonData);
        console.log("Multiple documents inserted to Collection");
    } catch (err) {
        console.log(err);
    }
}

async function dataInsertion(jsonData) {
    try {
        await connectDB();
        await insertData(jsonData);
    } catch (err) {
        console.log(err);
    }
}

module.exports = dataInsertion;