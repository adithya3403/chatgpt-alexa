const dotenv = require('dotenv');
dotenv.config();

const OpenAI = require('openai-api');
const openai = new OpenAI(process.env.OPENAI_API_KEY);

async function generate(prompt) {
    try {
        const gptResponse = await openai.complete({
            engine: 'text-davinci-003',
            prompt: prompt,
            temperature: 0,
            maxTokens: 1024,
        });
        return gptResponse;
    } catch (err) {
        console.log(err);
    }
}


// Input your desired topic for which 10 questions will be generated and then store them in a JSON file
// 3 Different variations of each question will be then generated
// Each variation also will be stored in the same JSON file
// All the answers will be generated using GPT-3 and then stored in the same JSON file


async function createQuestion(topic) {
    try {
        console.log(`\n   Generating questions for '${topic}'...`);
        let t1 = new Date().getTime();
        let prompt = `Ask 5 easy level questions on ${topic}. Each question should start in a new line and end with a question mark without any numbering.`;
        let questions = [];
        await generate(prompt).then((res) => {
            questions = res.data.choices[0].text.split("\n");
            // remove empty strings
            questions = questions.filter(function (el) {
                return el != "";
            });
        });
        console.log("   Questions generated successfully in " + ((new Date().getTime() - t1) / 1000).toPrecision(2) + "sec !\n");
        return questions;
    } catch (err) {
        console.log(err);
    }
}

async function createVariations(topic, questions) {
    try {
        console.log("   Generating variations for each question...");
        let t1 = new Date().getTime();
        let variations = {};
        variations["topic"] = topic;
        variations["questions"] = {};
        for (let i = 0; i < questions.length; i++) {
            variations["questions"]["question" + (i + 1)] = {};
            variations["questions"]["question" + (i + 1)]["question"] = questions[i];
            let prompt = `Give 3 different variations of the below question:\n${questions[i]}\nEach variation should start in a new line and end with a question mark without any numbering.`;
            await generate(prompt).then((res) => {
                let result = res.data.choices[0].text.split("\n");
                // remove empty strings
                result = result.filter(function (el) { return el != ""; });
                for (let j = 0; j < result.length; j++) {
                    variations["questions"]["question" + (i + 1)]["variation" + (j + 1)] = {};
                    variations["questions"]["question" + (i + 1)]["variation" + (j + 1)]["question"] = result[j];
                }
            });
        }
        console.log("   Variations generated successfully in " + ((new Date().getTime() - t1) / 1000).toPrecision(2) + "sec !\n");
        return variations;
    } catch (err) {
        console.log(err);
    }
}

async function writeToFile(fileName, obj) {
    try {
        writeFile(fileName, JSON.stringify(obj), function (err) {
            console.log("Writing to file...");
            if (err) throw err;
            console.log('Saved ' + fileName + '!\n');
        });
    } catch (err) {
        console.log(err);
    }
}

async function createAnswers(variations) {
    try {
        console.log("   Generating answers for each variation...");
        let t1 = new Date().getTime();
        for (let i = 0; i < Object.keys(variations["questions"]).length; i++) {
            for (let j = 0; j < Object.keys(variations["questions"]["question" + (i + 1)]).length; j++) {
                if (variations["questions"]["question" + (i + 1)]["variation" + (j + 1)] != undefined) {
                    let prompt = variations["questions"]["question" + (i + 1)]["variation" + (j + 1)]["question"];
                    await generate(prompt).then((res) => {
                        let result = res.data.choices[0].text;
                        // remove new lines and convert into well formatted answer
                        result = result.replace(/\n/g, '');
                        variations["questions"]["question" + (i + 1)]["variation" + (j + 1)]["answer"] = result;
                    });
                }
            }
        }
        console.log("   Answers generated successfully in " + ((new Date().getTime() - t1) / 1000) / 60 + "min !\n");
        return variations;
    } catch (err) {
        console.log(err);
    }
}

async function readFromFile(fileName) {
    try {
        // the file is JSON, so we need to parse it
        let obj = JSON.parse(readFileSync(fileName));
        return obj;
    } catch (err) {
        console.log(err);
    }
}

async function generateData(topic) {
    try {
        // write a synchronous function using .then to create questions and then variations
        let t1 = new Date().getTime();
        console.log("--------------------------------------------");
        console.log(`Generation start for ${topic}...`);
        let questions = await createQuestion(topic);
        let variations = await createVariations(topic, questions);
        let answers = await createAnswers(variations);
        console.log(`Total time taken for ${topic} : ` + ((new Date().getTime() - t1) / 1000) / 60 + "min !");
        console.log("--------------------------------------------\n");
        return answers;
    } catch (err) {
        console.log(err);
    }
}

module.exports = generateData;

/* Answers format : 
{
    "topic": "encapsulation",
    "questions": {
        "question1": {
            "question": "what is encapsulation?",
            "variation1": {
                "question": "what is meant by encapsulation?",
                "answer": "answer1"
            },
            "variation2": {
                "question": "explain about encapsulation?",
                "answer": "answer2"
            },
            "variation3": {
                "question": "define encapsulation?",
                "answer": "answer3"
            }
        },
        ........
    }
}
*/