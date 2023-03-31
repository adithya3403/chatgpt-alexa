from flask import Flask, render_template, request, url_for, redirect
import random
import string
import pymongo
from pymongo import MongoClient

app = Flask(__name__)

client = pymongo.MongoClient("mongodb+srv://adithya:adithya3403@cluster0.krmnoey.mongodb.net/?retryWrites=true&w=majority")
db = client["login"]
users_collection = db["users"]

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
