import React, { useState, useEffect } from "react";
import DeleteUserButton from "./DeleteUserButton.js";
import axios from "axios";
import { Link } from "react-router-dom";

const UserList = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        getUsers();
    }, []);

    const getUsers = async () => {
        const response = await axios.get("http://localhost:5050/data");
        setUsers(response.data);
    };

    const deleteUser = async (id) => {
        try {
            await axios.delete(`http://localhost:5050/data/${id}`);
            getUsers();
        } catch (error) {
            console.log(error);
        }
    };

    const [expandedUser, setExpandedUser] = useState(null);

    const toggleExpandUser = (user) => {
        if (expandedUser === user) {
            setExpandedUser(null);
        } else {
            setExpandedUser(user);
        }
    };

    return (
        <>
            <div
                className="container mt-5"
                style={{
                    padding: "50px",
                    border: "4px solid #ccc",
                    borderRadius: "10px",
                    width: "80%",
                }}
            >
                <h1 className="title is-1 has-text-centered">INTERVIEW RESULTS</h1>
                <hr></hr>
                <Link to="add" className="button is-success">Add New</Link>
                <div className="column is-20">
                    <table className="table is-striped mt-2 mb-2">
                        <thead>
                            <tr>
                                <th className="has-text-centered">No</th>
                                <th className="has-text-centered">Name</th>
                                <th className="has-text-centered">Topic</th>
                                <th className="has-text-centered">Rating</th>
                                <th className="has-text-centered">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => (
                                <React.Fragment key={user._id}>
                                    <tr>
                                        <td className="has-text-centered">{index + 1}</td>
                                        <td className="has-text-centered">{user.studentName}</td>
                                        <td className="has-text-centered">{user.topic}</td>
                                        <td className="has-text-centered">{user.rating}</td>
                                        <td className="has-text-centered">
                                            <button className="button is-info is-small mr-1"
                                                onClick={() => toggleExpandUser(user)}>
                                                {expandedUser === user ? "Collapse" : "Expand"}
                                            </button>
                                            <Link to={`edit/${user._id}`}
                                                className="button is-info is-small mr-1">Edit</Link>
                                            <DeleteUserButton user={user} onDelete={deleteUser} />
                                        </td>
                                    </tr>
                                    {expandedUser === user && (
                                        <tr>
                                            <td colSpan="5">
                                                <div
                                                    style={{
                                                        padding: "20px",
                                                        border: "2px solid #ccc",
                                                        borderRadius: "10px",
                                                    }}>
                                                    <p><strong>Name:</strong> {user.studentName}</p>
                                                    <p><strong>Login ID:</strong> {user.LoginID}</p>
                                                    <p><strong>Password:</strong> {user.Password}</p>
                                                    <p><strong>Topic:</strong> {user.topic}</p>
                                                    <p><strong>Start Time:</strong> {user.startTime}</p>
                                                    <p><strong>End Time:</strong> {user.endTime}</p>
                                                    <p><strong>Duration:</strong> {user.duration}</p>
                                                    <p><strong>Final Score:</strong> {user.rating}</p>
                                                    <p>
                                                        <strong>Questions:</strong>
                                                        <ul>
                                                            {Object.entries(user.questions).map(([key, value]) => (
                                                                <li key={key}>
                                                                    <p>
                                                                        &nbsp;&nbsp;&nbsp;&nbsp;
                                                                        <strong>Question:</strong> {value.question}<br></br>
                                                                        &nbsp;&nbsp;&nbsp;&nbsp;
                                                                        <strong>Answer:</strong> {value.studentAns}<br></br>
                                                                        &nbsp;&nbsp;&nbsp;&nbsp;
                                                                        <strong>Rating:</strong> {value.rating}
                                                                    </p>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default UserList;
