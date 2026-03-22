import React, { useState, useEffect } from 'react';
import './GmailModal.css';

const GmailModal = ({ isOpen, onClose, ticket, currentUser, onSend }) => {
  const [toType, setToType] = useState('worker');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (ticket) {
      setSubject(`Re: [CASE #${ticket.ticketNumber || ticket.id}] ${ticket.title}`);
    }
  }, [ticket]);

  if (!isOpen || !ticket) return null;

  const handleSend = async () => {
    setSending(true);
    try {
      await onSend({ to: toType, subject, body });
      onClose();
      setBody('');
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  const getRecipientEmail = () => {
    if (toType === 'worker') return ticket.worker?.email || 'N/A';
    if (toType === 'manager') return 'manager@gira.com';
    if (toType === 'provider') return ticket.provider?.email || 'N/A';
    return '';
  };

  return (
    <div className="gmail-overlay" onClick={onClose}>
      <div className="gmail-window" onClick={e => e.stopPropagation()}>
        <div className="gmail-header">
          <span>New Message</span>
          <div className="gmail-header-actions">
            <button onClick={onClose}>×</button>
          </div>
        </div>
        
        <div className="gmail-fields">
          <div className="gmail-field">
            <span className="field-label">From:</span>
            <span className="field-value">{currentUser?.email} (GIRA System)</span>
          </div>
          <div className="gmail-field">
            <span className="field-label">To:</span>
            <select 
              className="gmail-select" 
              value={toType} 
              onChange={e => setToType(e.target.value)}
            >
              <option value="worker">Worker ({ticket.worker?.name || 'User'})</option>
              <option value="manager">Manager (Helpdesk Admin)</option>
              {currentUser?.role !== 'PROVIDER' && <option value="provider">Provider ({ticket.provider?.name || 'Not assigned'})</option>}
            </select>
            <span className="recipient-preview">{getRecipientEmail()}</span>
          </div>
          <div className="gmail-field">
            <input 
              type="text" 
              placeholder="Subject" 
              className="gmail-input"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
          </div>
        </div>

        <div className="gmail-composer">
          <textarea 
            placeholder="Write your message here..."
            className="gmail-textarea"
            value={body}
            onChange={e => setBody(e.target.value)}
          />
        </div>

        <div className="gmail-footer">
          <button className="gmail-send-btn" onClick={handleSend} disabled={sending || !body.trim()}>
            {sending ? 'Sending...' : 'Send'}
          </button>
          <div className="gmail-footer-tools">
            <span title="Formatting options">A</span>
            <span title="Attach files">📎</span>
            <span title="Insert link">🔗</span>
            <span title="Insert emoji">😊</span>
          </div>
          <button className="gmail-trash-btn" title="Discard" onClick={onClose}>🗑️</button>
        </div>
      </div>
    </div>
  );
};

export default GmailModal;
