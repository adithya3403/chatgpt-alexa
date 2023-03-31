// we succesfully added our data into the backend 
// now we need to display it in the frontend

import React, { useState, useEffect } from "react";
import DeleteUserButton from "./DeleteUserButton.js";
import axios from "axios";
import { Link } from "react-router-dom";

const UserList = () => {
    const [users, setUser] = useState([]);
    useEffect(() => {
        getUsers();
    }
        , []);

    const getUsers = async () => {
        const response = await axios.get("http://localhost:5050/data");
        setUser(response.data);
    };

    const deleteUser = async (id) => {
        try {
            await axios.delete(`http://localhost:5050/data/${id}`);
            getUsers();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            <div className="container mt-5" style={{ padding: "15px", border: "4px solid #ccc", borderRadius: "10px" }}>
                <h1 className="title is-1 has-text-centered">INTERVIEW DATABASE</h1><hr></hr>
                <div className="column is-20">
                    <Link to="add" className="button is-success">Add New</Link>
                    <table className="table is-striped is-fullwidth mt-2 mb-2">
                        <thead>
                            <tr>
                                <th className="has-text-centered">No</th>
                                <th className="has-text-centered">Name</th>
                                <th className="has-text-centered">Topics</th>
                                <th className="has-text-centered">Question</th>
                                <th className="has-text-centered">Student Answer</th>
                                {/* <th className="has-text-centered">ChatGPT Answer</th> */}
                                <th className="has-text-centered">Rating</th>
                                <th className="has-text-centered">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => (
                                <tr key={user._id}>
                                    <td className="has-text-centered">{index + 1}</td>
                                    <td className="has-text-centered">{user.studentName}</td>
                                    <td className="has-text-centered">{user.topic}</td>
                                    <td style={{ fontSize: "0.8em" }}>{user.question}</td>
                                    <td style={{ fontSize: "0.8em" }}>{user.studentAns}</td>
                                    {/* <td style={{ fontSize: "0.6em" }}>{user.chatGPTAns}</td> */}
                                    <td className="has-text-centered">{user.rating}</td>
                                    <td className="has-text-centered">
                                        <Link to={`edit/${user._id}`} className="button is-info is-small mr-1">Edit</Link>
                                        <DeleteUserButton user={user} onDelete={deleteUser} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default UserList;