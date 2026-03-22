import React, { useState, useEffect } from 'react';
import { userAPI, ticketAPI } from '../services/api';
import './AssignTicketModal.css';

const AssignTicketModal = ({ ticketId, ticketTitle, onAssignSuccess, onClose, managerName }) => {
    const [providers, setProviders] = useState([]);
    const [selectedProviderId, setSelectedProviderId] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingProviders, setFetchingProviders] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                setFetchingProviders(true);
                const response = await userAPI.getByRole('provider');
                if (response.success) {
                    setProviders(response.data);
                } else {
                    setError('Failed to fetch providers');
                }
            } catch (err) {
                setError(err.message || 'Error fetching providers');
            } finally {
                setFetchingProviders(false);
            }
        };

        fetchProviders();
    }, []);

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!selectedProviderId) {
            setError('Please select a provider');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const response = await ticketAPI.assignWithNotification(
                ticketId, 
                selectedProviderId, 
                managerName || 'GIRA Manager'
            );

            if (response.success) {
                setSuccessMessage('Ticket assigned successfully! Email notification has been sent to the provider.');
                setTimeout(() => {
                    onAssignSuccess(response.data);
                    onClose();
                }, 2000);
            } else {
                setError(response.message || 'Failed to assign ticket');
            }
        } catch (err) {
            setError(err.message || 'An error occurred during assignment');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (isDirty && !successMessage) {
            if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Assign Ticket</h2>
                    <button className="close-btn" onClick={handleClose}>&times;</button>
                </div>
                
                <div className="modal-body">
                    <div className="ticket-info">
                        <span className="info-label">Ticket ID:</span>
                        <span className="info-value">TKT-{String(ticketId).padStart(4, '0')}</span>
                    </div>
                    <div className="ticket-info">
                        <span className="info-label">Title:</span>
                        <span className="info-value">{ticketTitle}</span>
                    </div>

                    <div className="notification-info">
                        <div className="info-icon">i</div>
                        <p>The selected provider will receive an automated email notification with ticket details and a direct link.</p>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}
                    {successMessage && <div className="alert alert-success">{successMessage}</div>}

                    <form onSubmit={handleAssign}>
                        <div className="form-group">
                            <label htmlFor="provider-select">Select Provider</label>
                            {fetchingProviders ? (
                                <div className="fetching-loader">
                                    <div className="spinner-small"></div>
                                    <span>Loading providers...</span>
                                </div>
                            ) : (
                                <select 
                                    id="provider-select"
                                    value={selectedProviderId}
                                    onChange={(e) => {
                                        setSelectedProviderId(e.target.value);
                                        setIsDirty(true);
                                    }}
                                    disabled={loading || successMessage}
                                    className={error && !selectedProviderId ? 'input-error' : ''}
                                >
                                    <option value="">-- Choose a Provider --</option>
                                    {providers.map(provider => (
                                        <option key={provider.id} value={provider.id}>
                                            {provider.name} ({provider.email})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button 
                                type="button" 
                                className="btn-secondary" 
                                onClick={handleClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="btn-primary" 
                                disabled={loading || fetchingProviders || successMessage || !selectedProviderId}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-small"></span>
                                        Assigning...
                                    </>
                                ) : (
                                    'Assign & Send Email'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AssignTicketModal;
