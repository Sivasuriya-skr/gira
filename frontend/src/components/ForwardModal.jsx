import React, { useState } from "react";

const ForwardModal = ({ isOpen, onClose, onConfirm }) => {
    const [reason, setReason] = useState("");

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!reason.trim()) {
            alert("Please provide a reason for forwarding.");
            return;
        }
        onConfirm(reason);
        setReason("");
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
                <h2 className="panel-title">🔁 Forward Ticket to Manager</h2>
                <p className="stat-label" style={{ marginBottom: "1.5rem" }}>
                    Please explain why you are forwarding this ticket back to management for re-assignment.
                </p>
                <textarea
                    className="search-box"
                    style={{ height: "120px", padding: "1rem", marginBottom: "1.5rem", resize: "none" }}
                    placeholder="Provide a detailed reason..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
                <div className="modal-actions">
                    <button className="primary-btn" onClick={handleSubmit}>
                        Confirm Forward
                    </button>
                    <button className="secondary-btn" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForwardModal;
