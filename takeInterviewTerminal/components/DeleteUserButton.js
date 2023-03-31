import React, { useState } from "react";
import Modal from "react-modal";
import "../App.css";

const customStyles = {
    content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)"
    }
};

const DeleteUserButton = ({ user, onDelete }) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const openModal = () => { setModalIsOpen(true)};
    const closeModal = () => { setModalIsOpen(false)};
    const handleDelete = () => {
        onDelete(user._id);
        closeModal();
    };

    return (
        <>
            <button onClick={openModal} className="button is-danger is-small">Delete</button>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Confirm Delete Modal"
                id="ReactModal"
                >
                <h2 className="is-size-4 has-text-weight-bold has-text-centered">Confirm Delete</h2>
                <p className="is-size-4 has-text-centered">
                    This action cannot be undone!<br></br>
                    Are you sure you want to delete this user?
                </p>
                <div className="buttons is-centered mt-2">
                    <button onClick={handleDelete} className="button is-danger">Delete</button>
                    <button onClick={closeModal} className="button">Cancel</button>
                </div>
            </Modal>
        </>
    );
};

export default DeleteUserButton;