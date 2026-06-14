import React from 'react';

const HeadersPanel = ({ headers, setHeaders }) => {
  const commonHeaders = [
    { key: 'Content-Type', value: 'application/json' },
    { key: 'Authorization', value: 'Bearer ' },
    { key: 'Accept', value: 'application/json' }
  ];

  const addHeader = () => {
    setHeaders([
      ...headers,
      { id: Date.now(), key: '', value: '' }
    ]);
  };

  const updateHeader = (id, field, value) => {
    setHeaders(headers.map(header =>
      header.id === id ? { ...header, [field]: value } : header
    ));
  };

  const removeHeader = (id) => {
    setHeaders(headers.filter(header => header.id !== id));
  };

  const setCommonHeader = (commonHeader) => {
    const existing = headers.find(h => h.key === commonHeader.key);
    if (existing) {
      updateHeader(existing.id, 'value', commonHeader.value);
    } else {
      setHeaders([
        ...headers,
        { id: Date.now(), key: commonHeader.key, value: commonHeader.value }
      ]);
    }
  };

  return (
    <div className="headers-panel">
      <div className="panel-header">
        <h3>Headers</h3>
        <button onClick={addHeader} className="add-btn">+ Add Header</button>
      </div>
      <div className="common-headers">
        <span className="common-label">Common Headers:</span>
        {commonHeaders.map(header => (
          <button
            key={header.key}
            onClick={() => setCommonHeader(header)}
            className="common-header-btn"
          >
            {header.key}
          </button>
        ))}
      </div>
      <div className="headers-list">
        {headers.map(header => (
          <div key={header.id} className="header-row">
            <input
              type="text"
              placeholder="Header Name"
              value={header.key}
              onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
              className="header-key"
            />
            <input
              type="text"
              placeholder="Header Value"
              value={header.value}
              onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
              className="header-value"
            />
            <button onClick={() => removeHeader(header.id)} className="remove-btn">×</button>
          </div>
        ))}
      </div>
      {headers.length === 0 && (
        <p className="empty-message">No headers added. Click "Add Header" to add custom headers.</p>
      )}
    </div>
  );
};

export default HeadersPanel;