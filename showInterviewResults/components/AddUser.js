import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddUser = () => {
    const [studentName, setStudentName] = useState("");
    const [topic, settopic] = useState("");
    const [question, setQuestion] = useState("");
    const [studentAns, setStudentAns] = useState("");
    const [rating, setRating] = useState("");
    const navigate = useNavigate();

    const saveUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:5050/data", {
                studentName,
                topic,
                question,
                studentAns,
                rating,
            });
            navigate("/");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="columns mt-5">
            <div className="column is-half">
                <form onSubmit={saveUser}>
                    <div className="field">
                        <label className="label">Student Name</label>
                        <div className="control">
                            <input
                                type="text"
                                className="input"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                placeholder="Name"
                            />
                        </div>
                    </div>
                    <div className="field">
                        <label className="label">Topic</label>
                        <div className="control">
                            <input
                                type="text"
                                className="input"
                                value={topic}
                                onChange={(e) => settopic(e.target.value)}
                                placeholder="topic"
                            />
                        </div>
                    </div>
                    <div className="field">
                        <label className="label">Question</label>
                        <div className="control">
                            <input
                                type="text"
                                className="input"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="question"
                            />
                        </div>
                    </div>
                    <div className="field">
                        <label className="label">Student Answer</label>
                        <div className="control">
                            <input
                                type="text"
                                className="input"
                                value={studentAns}
                                onChange={(e) => setStudentAns(e.target.value)}
                                placeholder="studentAns"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="label">Rating</label>
                        <div className="control">
                            <input
                                type="number"
                                className="input"
                                value={rating}
                                onChange={(e) => {
                                    if (e.target.value > 10) setRating(10);
                                    else if (e.target.value < 0) setRating(0);
                                    else setRating(e.target.value);
                                }
                                }
                                placeholder="Enter rating between 0 and 10"
                            />
                        </div>
                    </div>
                    <br></br>
                    <div className="field">
                        <div className="control">
                            <button type="submit" className="button is-success">
                                Save to DB
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUser;