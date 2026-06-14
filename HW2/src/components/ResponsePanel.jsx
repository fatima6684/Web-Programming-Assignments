import React, { useState } from 'react';

const ResponsePanel = ({ response, loading, error }) => {
  const [activeTab, setActiveTab] = useState('body');
  
  if (loading) {
    return (
      <div className="response-panel loading">
        <div className="loading-spinner"></div>
        <p>Sending request...</p>
      </div>
    );
  }
  
  if (!response && !error) {
    return (
      <div className="response-panel empty">
        <p>No response yet. Send a request to see results.</p>
      </div>
    );
  }
  
  const statusCode = response?.status || error?.status || 0;
  const statusText = response?.statusText || error?.statusText || 'Error';
  const isError = error?.isError || response?.isError || false;
  const responseData = response?.data || error?.data || null;
  
  const getStatusClass = () => {
    if (statusCode >= 200 && statusCode < 300) return 'success';
    if (statusCode >= 300 && statusCode < 400) return 'redirect';
    if (statusCode >= 400 && statusCode < 500) return 'client-error';
    if (statusCode >= 500) return 'server-error';
    return 'unknown';
  };
  
  const formatResponse = () => {
    if (typeof responseData === 'object') {
      return JSON.stringify(responseData, null, 2);
    }
    return String(responseData);
  };
  
  return (
    <div className="response-panel">
      <div className="response-header">
        <div className={`status-code ${getStatusClass()}`}>
          Status: {statusCode} {statusText}
          {isError && ' (Error)'}
        </div>
      </div>
      
      <div className="response-tabs">
        <button 
          className={`tab-btn ${activeTab === 'body' ? 'active' : ''}`}
          onClick={() => setActiveTab('body')}
        >
          Response Body
        </button>
        <button 
          className={`tab-btn ${activeTab === 'headers' ? 'active' : ''}`}
          onClick={() => setActiveTab('headers')}
        >
          Headers
        </button>
      </div>
      
      <div className="response-content">
        {activeTab === 'body' && (
          <pre className="response-body">
            {formatResponse()}
          </pre>
        )}
        {activeTab === 'headers' && response?.headers && (
          <pre className="response-headers">
            {JSON.stringify(response.headers, null, 2)}
          </pre>
        )}
        {activeTab === 'headers' && !response?.headers && (
          <p>No headers available</p>
        )}
      </div>
    </div>
  );
};

export default ResponsePanel;