// add the studentResult.json to the database
// the studentResult.json is the result of the student's test


const mongoose = require('mongoose');
const fs = require('fs');
const Data = require('../server/model.js');

mongoose.set('strictQuery', true);

async function connectDB() {
    try {
        await mongoose.connect('mongodb://localhost:27017/results', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

async function insertData() {
    try {
        // get data from ./studentResult.json
        const data = fs.readFileSync('./studentResult.json');
        const jsonData = JSON.parse(data);
        await Data.insertMany(jsonData);
        console.log("Data inserted to DB");
    } catch (err) {
        console.log(err);
    }
}

async function exit() {
    try {
        await mongoose.disconnect();
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

async function insertToDB() {
    try {
        await connectDB();
        await insertData();
        await exit();
    } catch (err) {
        console.log(err);
    }
}

// insertToDB();

module.exports = insertToDB;