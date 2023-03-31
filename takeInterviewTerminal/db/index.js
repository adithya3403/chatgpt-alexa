const Data = require('./data.json');
const { exec } = require('child_process');
const fs = require('fs');
const mongoose = require('mongoose');
const insertToDB = require('./insertToDB');

mongoose.set('strictQuery', true);

function getTopics() {
    let topics = [];
    Object.keys(Data).forEach((topic) => {
        topics.push(Data[topic].topic);
    });
    return topics;
};

function getQuestions(topicName) {
    let questions = [];
    Object.keys(Data).forEach((topic) => {
        if (Data[topic].topic === topicName) {
            for (let i = 1; i <= 5; i++) {
                questions.push(Data[topic].questions[`question${i}`].question);
            }
        }
    });
    return questions;
};

function getVariations(topicName, question) {
    let variations = [];
    Object.keys(Data).forEach((topic) => {
        if (Data[topic].topic === topicName) {
            for (let i = 1; i <= 5; i++) {
                if (Data[topic].questions[`question${i}`].question === question) {
                    for (let j = 1; j <= 3; j++) {
                        variations.push(Data[topic].questions[`question${i}`][`variation${j}`].question);
                    }
                }
            }
        }
    });
    return variations;
};

function getAns(topicName, question) {
    let answers = [];
    Object.keys(Data).forEach((topic) => {
        if (Data[topic].topic === topicName) {
            for (let i = 1; i <= 5; i++) {
                if (Data[topic].questions[`question${i}`].question === question) {
                    // add all the answers to the answer array
                    for (let j = 1; j <= 3; j++) {
                        answers.push(Data[topic].questions[`question${i}`][`variation${j}`].answer);
                    }
                }
            }
        }
    });
    return answers;
};

async function getVoiceAns() {
    return new Promise((resolve, reject) => {
        const command = `python convert.py`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error running Python script: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.error(`Python script stderr: ${stderr}`);
                reject(stderr);
                return;
            }
            const recognizedText = stdout.trim();
            resolve(recognizedText);
        });
    });
};

async function getScore() {
    return new Promise((resolve, reject) => {
        const command = `python similarity.py`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error running Python script: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.error(`Python script stderr: ${stderr}`);
                reject(stderr);
                return;
            }
            const score = stdout.trim();
            resolve(score);
        });
    });
};

async function createJSON(topic, question, variation, chatGPTAns, studentAns, score) {
    // write into json file
    const data = {
        "topic": topic,
        "studentName": "Adithya",
        "question": question,
        "chatGPTAns": chatGPTAns,
        "studentAns": studentAns,
        "rating": score
    };
    // create a file called studentResult.json and write into it
    fs.writeFile('studentResult.json', JSON.stringify(data), (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });
};


async function main() {
    console.log("\n\n\t\tWelcome to the Interview!\n");
    const topics = getTopics();
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    console.log("\nTopic: " + randomTopic + "\n");

    const questions = getQuestions(randomTopic);
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    const variations = getVariations(randomTopic, randomQuestion);
    const randomVariation = variations[Math.floor(Math.random() * variations.length)];
    console.log("Question: " + randomVariation);

    for (let i = 0; i < 5; i++) {
        await new Promise(r => setTimeout(r, 1000));
        console.log(5 - i);
        if (i === 4) {
            await new Promise(r => setTimeout(r, 1000));
            console.log("Speak your answer now:\n");
        }
    }

    // chatgpt answer is an array of 3 answers
    const chatGPTAns = getAns(randomTopic, randomQuestion);
    // console.log(chatGPTAns);

    const voiceAns = await getVoiceAns();
    // print the last line of the output
    const ans = voiceAns.split("\n");
    const lastLine = ans[ans.length - 1];
    console.log("Answer from Voice: " + lastLine + "\n");

    // write lastLine and array of chatGPTAns into a json file for comparison
    fs.writeFile('answers.json', JSON.stringify({
        "studentAns": lastLine,
        "chatGPTAns": chatGPTAns
    }), (err) => {
        if (err) console.log(err);
    });

    const score = await getScore();
    // console.log("Score: " + score + "\n");

    await createJSON(randomTopic, randomQuestion, randomVariation, chatGPTAns, lastLine, score);
    console.log("Thankyou!");

    // after creating the json file, wait for 2 seconds and insert to database
    await new Promise(r => setTimeout(r, 2000));
    await insertToDB();
}

main();