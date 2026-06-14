import React from 'react';
import RequestForm from './RequestForm';

const RequestTabs = ({ tabs, activeTabId, onTabChange, onAddTab, onCloseTab, onUpdateTabData, onSendRequest }) => {
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  
  const handleDataChange = (data) => {
    onUpdateTabData(activeTabId, data);
  };
  
  const handleSendRequest = async (method, url, headers, body) => {
    if (onSendRequest) {
      await onSendRequest(activeTabId, method, url, headers, body);
    } else if (activeTab?.onSendRequest) {
      await activeTab.onSendRequest(method, url, headers, body);
    } else {
      console.error('onSendRequest is not defined');
    }
  };
  
  if (!activeTab) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="request-tabs">
      <div className="tabs-header">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="tab-method">{tab.data.method}</span>
            <span className="tab-url">{tab.data.url || 'New Request'}</span>
            {tabs.length > 1 && (
              <button
                className="close-tab"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button onClick={onAddTab} className="add-tab-btn">+</button>
      </div>
      <div className="tab-content">
        <RequestForm
          onSendRequest={handleSendRequest}
          loading={activeTab.loading || false}
          initialData={activeTab.data}
          onDataChange={handleDataChange}
        />
      </div>
    </div>
  );
};

export default RequestTabs;