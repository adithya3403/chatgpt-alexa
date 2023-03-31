const mongoose = require('mongoose');

// Schema
const Data = new mongoose.Schema({
    "studentName": { "type": "String" },
    "topic": { "type": "String" },
    "question": { "type": "String" },
    "studentAns": { "type": "String" },
    "chatGPTAns": {
        // this should be an array of 3 strings
        "type": [String, String, String],
    },
    "rating": { "type": "Number" }
});

// Model
const DataModel = mongoose.model('Data', Data);
module.exports = DataModel;