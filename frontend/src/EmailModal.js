import React from 'react';

const Modal = ({ isOpen, onClose, content }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose}>x</button>
        <h2>{content.subject}</h2>
        <p>{formatDate(content.date)}</p>
        <p>From: {content.from}</p>
        <pre>{content.body.replace(/\s+/g, ' ')}</pre>
      </div>
    </div>
  );
};

export default Modal;