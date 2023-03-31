const mongoose = require('mongoose');
const fs = require('fs');
const Data = require('../server/model.js');

mongoose.set('strictQuery', true);

function retrieveData() {
    mongoose.connect("mongodb://localhost:27017/mern-data", { useNewUrlParser: true, useUnifiedTopology: true });
    mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
    mongoose.connection.once('open', function () {
        console.log("Connected to database!");
    });
    Data.find({}, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            fs.writeFile('data.json', JSON.stringify(data), function (err) {
                console.log("Check json file!");
                process.exit(0);
            });
        }
    });
}

retrieveData();