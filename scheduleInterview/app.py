import json
import random
import string

import pymongo
from flask import Flask, redirect, render_template, request, url_for
from pymongo import MongoClient

app = Flask(__name__)

# create a json file "config.json" with the database name, collection name and mongodb uri
# replace mongodb uri with your own mongodb ATLAS URI
with open('config.json') as f:
    config = json.load(f)
    MONGODB_URI=config['MONGODB_URI']
    DB_NAME=config['DB_NAME']
    COLLECTION_NAME=config['COLLECTION_NAME']

client = pymongo.MongoClient(MONGODB_URI)
db = client[DB_NAME]
users_collection = db[COLLECTION_NAME]

@app.route('/', methods=['GET', 'POST'])
def index():
    topics = [
        "Java", "Python", "Machine Learning",
        "Operating systems", "Data Structures",
        "Database Management Systems"
    ]
    difficulties = ['Easy', 'Medium', 'Hard']
    return render_template('index.html', topics=topics, difficulties=difficulties)

@app.route('/submit', methods=['POST'])
def submit():
    name = request.form['name']
    topic = request.form['topic']
    difficulty = request.form['difficulty']

    # Generate random id and password
    id = ''.join(random.choice(string.digits) for _ in range(6))
    password = ''.join(random.choice(string.digits) for _ in range(8))

    # Insert into database
    doc={
        "Name": name,
        "ID": id,
        "Password": password,
        "Topic": topic,
        "Difficulty": difficulty
    }
    users_collection.insert_one(doc)

    # let the user know that the data has been inserted
    print("Data inserted successfully!")
    return render_template('result.html', name=name, topic=topic, difficulty=difficulty, id=id, password=password)

@app.route('/register', methods=['GET'])
def register():
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
