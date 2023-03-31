import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EditUser = () => {
    const [studentName, setStudentName] = useState("");
    const [topic, settopic] = useState("");
    const [rating, setRating] = useState("");
    const navigate = useNavigate();

    const { id } = useParams();

    useEffect(() => {
        getUserById();
    }, []);

    const getUserById = async () => {
        const response = await axios.get(`http://localhost:5050/data/${id}`);
        setStudentName(response.data.studentName);
        settopic(response.data.topic);
        setRating(response.data.rating);
    };

    const updateUser = async (e) => {
        try {
            e.preventDefault();
            const response = await axios.put(`http://localhost:5050/data/${id}`, {
                studentName,
                topic,
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
                <form onSubmit={updateUser}>
                    <div className="field">
                        <label className="label">Student Name</label>
                        <div className="control">
                            <input
                                type="text"
                                className="input"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                placeholder="Student Name"
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
                                placeholder="Topic"
                            />
                        </div>
                    </div>
                    <div className="field">
                        <label className="label">Rating</label>
                        <div className="control">
                            <input
                                type="number"
                                className="input"
                                value={rating}
                                onChange={(e) => {
                                    setRating(e.target.value);
                                    if (e.target.value > 10) setRating(10);
                                    else if (e.target.value < 0) setRating(0);
                                    else setRating(e.target.value);
                                }}
                                placeholder="Rating"
                            />
                        </div>
                    </div>
                    <div className="field">
                        <div className="control">
                            <button type="submit" className="button is-success">
                                Update
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUser;    