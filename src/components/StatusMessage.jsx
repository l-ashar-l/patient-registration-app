import React, { useEffect } from 'react';

const StatusMessage = ({ message, isError, onClear }) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                if (onClear) onClear();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message, onClear]);

    if (!message) return null;

    return (
        <div className={`status-message ${isError ? 'error' : 'success'}`}>
            <span>{message}</span>
            {onClear && (
                <button className="status-message-close" onClick={onClear}>
                    &times;
                </button>
            )}
        </div>
    );
};

export default StatusMessage;