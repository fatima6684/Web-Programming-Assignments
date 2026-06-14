import React from 'react';

const HistoryPanel = ({ history, onLoadRequest, onClearHistory }) => {
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };
  
  if (history.length === 0) {
    return (
      <div className="history-panel">
        <h3>Request History</h3>
        <p className="empty-message">No requests in history. Send some requests to see them here.</p>
      </div>
    );
  }
  
  return (
    <div className="history-panel">
      <div className="panel-header">
        <h3>Request History</h3>
        <button onClick={onClearHistory} className="clear-history-btn">Clear History</button>
      </div>
      <div className="history-list">
        {history.map((item, index) => (
          <div key={index} className="history-item" onClick={() => onLoadRequest(item)}>
            <div className="history-method-status">
              <span className={`method-badge method-${item.method.toLowerCase()}`}>
                {item.method}
              </span>
              <span className={`status-badge ${item.status >= 200 && item.status < 300 ? 'success' : 'error'}`}>
                {item.status}
              </span>
            </div>
            <div className="history-url">{item.url}</div>
            <div className="history-time">{formatDate(item.timestamp)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPanel;