import React, { useState, useEffect } from 'react';
import { validateUrl, validateJsonBody } from '../utils/validation';
import { buildUrlWithParams, parseParamsFromUrl } from '../utils/requestHelpers';
import ParametersPanel from './ParametersPanel';
import HeadersPanel from './HeadersPanel';

const RequestForm = ({ onSendRequest, loading, initialData, onDataChange }) => {
  const [method, setMethod] = useState(initialData?.method || 'GET');
  const [url, setUrl] = useState(initialData?.url || '');
  const [body, setBody] = useState(initialData?.body || '');
  const [parameters, setParameters] = useState(initialData?.parameters || []);
  const [headers, setHeaders] = useState(initialData?.headers || [
    { id: Date.now(), key: 'Content-Type', value: 'application/json' }
  ]);
  const [urlError, setUrlError] = useState('');
  const [jsonError, setJsonError] = useState('');

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

  useEffect(() => {
    if (onDataChange) {
      onDataChange({ method, url, body, parameters, headers });
    }
  }, [method, url, body, parameters, headers]);

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    const validation = validateUrl(newUrl);
    setUrlError(validation.message);
    
    if (validation.isValid && !newUrl.includes('?')) {
      const { baseUrl, params } = parseParamsFromUrl(newUrl);
      if (params.length > 0) {
        setUrl(baseUrl);
        setParameters(params);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateUrl(url);
    if (!validation.isValid) {
      setUrlError(validation.message);
      return;
    }

    const jsonValidation = validateJsonBody(body);
    if (!jsonValidation.isValid) {
      setJsonError(jsonValidation.message);
      return;
    }

    const finalUrl = buildUrlWithParams(url, parameters);
    
    const headersObject = {};
    headers.forEach(header => {
      if (header.key && header.key.trim()) {
        headersObject[header.key] = header.value;
      }
    });

    let requestBody = null;
    if (body && body.trim()) {
      try {
        requestBody = JSON.parse(body);
      } catch {
        requestBody = body;
      }
    }

    if (onSendRequest) {
      await onSendRequest(method, finalUrl, headersObject, requestBody);
    } else {
      console.error('onSendRequest is not defined in RequestForm');
    }
  };

  const clearAll = () => {
    setMethod('GET');
    setUrl('');
    setBody('');
    setParameters([]);
    setHeaders([{ id: Date.now(), key: 'Content-Type', value: 'application/json' }]);
    setUrlError('');
    setJsonError('');
  };

  const canSendBody = ['POST', 'PUT', 'PATCH'].includes(method);

  return (
    <form onSubmit={handleSubmit} className="request-form">
      <div className="request-line">
        <select 
          value={method} 
          onChange={(e) => setMethod(e.target.value)}
          className="method-select"
        >
          {methods.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Enter URL (e.g., https://api.example.com/users)"
          value={url}
          onChange={handleUrlChange}
          className={`url-input ${urlError ? 'error' : ''}`}
        />
        <button 
          type="submit" 
          disabled={loading || urlError}
          className="send-btn"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
        <button 
          type="button" 
          onClick={clearAll}
          className="clear-btn"
        >
          Clear All
        </button>
      </div>
      
      {urlError && <div className="error-message">{urlError}</div>}
      
      <div className="request-details">
        <ParametersPanel parameters={parameters} setParameters={setParameters} />
        <HeadersPanel headers={headers} setHeaders={setHeaders} />
      </div>
      
      {canSendBody && (
        <div className="body-section">
          <label>Request Body (JSON)</label>
          <textarea
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              const validation = validateJsonBody(e.target.value);
              setJsonError(validation.message);
            }}
            placeholder='{"key": "value"}'
            className={`body-textarea ${jsonError ? 'error' : ''}`}
            rows={8}
          />
          {jsonError && <div className="error-message">{jsonError}</div>}
        </div>
      )}
    </form>
  );
};

export default RequestForm;