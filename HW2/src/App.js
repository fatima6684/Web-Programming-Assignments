import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [collections, setCollections] = useState([]);
  const [showNewCollectionDialog, setShowNewCollectionDialog] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

  // ============ CREATE NEW TAB ============
  const createNewTab = () => {
    const newTabId = Date.now();
    const newTab = {
      id: newTabId,
      method: 'GET',
      url: '',
      body: '',
      parameters: [],
      headers: [{ id: Date.now(), key: 'Content-Type', value: 'application/json' }],
      response: null,
      loading: false,
      error: null
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTabId);
    return newTabId;
  };

  // ============ CLOSE TAB ============
  const closeTab = (tabId) => {
    if (tabs.length === 1) {
      createNewTab();
    }
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId && newTabs.length > 0) {
      setActiveTabId(newTabs[0].id);
    }
  };

  // ============ UPDATE CURRENT TAB ============
  const updateCurrentTab = (updates) => {
    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId ? { ...tab, ...updates } : tab
    ));
  };

  // ============ GET CURRENT TAB ============
  const getCurrentTab = () => {
    return tabs.find(tab => tab.id === activeTabId);
  };

  // ============ LOAD FROM LOCALSTORAGE ON START ============
  useEffect(() => {
    const savedTabs = localStorage.getItem('api-tabs');
    if (savedTabs) {
      try {
        const parsed = JSON.parse(savedTabs);
        if (parsed.length > 0) {
          setTabs(parsed);
          setActiveTabId(parsed[0].id);
        } else {
          createNewTab();
        }
      } catch(e) { 
        createNewTab();
      }
    } else {
      createNewTab();
    }

    const savedCollections = localStorage.getItem('api-collections');
    if (savedCollections) {
      try {
        const parsed = JSON.parse(savedCollections);
        if (parsed.length > 0) {
          setCollections(parsed);
        }
      } catch(e) { 
        console.error(e);
      }
    }
  }, []);

  // ============ SAVE TABS TO LOCALSTORAGE ============
  useEffect(() => {
    if (tabs.length > 0) {
      localStorage.setItem('api-tabs', JSON.stringify(tabs));
    }
  }, [tabs]);

  // ============ SAVE COLLECTIONS TO LOCALSTORAGE ============
  useEffect(() => {
    localStorage.setItem('api-collections', JSON.stringify(collections));
  }, [collections]);

  // ============ BUILD URL WITH PARAMETERS ============
  const buildUrlWithParams = (baseUrl, params) => {
    if (!params || params.length === 0) return baseUrl;
    const validParams = params.filter(p => p.key && p.key.trim() !== '');
    if (validParams.length === 0) return baseUrl;
    
    try {
      const urlObj = new URL(baseUrl);
      validParams.forEach(param => {
        urlObj.searchParams.append(param.key, param.value || '');
      });
      return urlObj.toString();
    } catch {
      return baseUrl;
    }
  };

  // ============ SEND REQUEST ============
  const sendRequest = async () => {
    const currentTab = getCurrentTab();
    if (!currentTab) return;
    
    if (!currentTab.url) {
      updateCurrentTab({ error: { message: 'URL cannot be empty' } });
      return;
    }
    
    if (!currentTab.url.startsWith('http://') && !currentTab.url.startsWith('https://')) {
      updateCurrentTab({ error: { message: 'URL must start with http:// or https://' } });
      return;
    }

    updateCurrentTab({ loading: true, error: null });
    
    try {
      const finalUrl = buildUrlWithParams(currentTab.url, currentTab.parameters);
      
      const headersObject = {};
      currentTab.headers.forEach(header => {
        if (header.key && header.key.trim()) {
          headersObject[header.key] = header.value;
        }
      });

      let requestBody = null;
      if (currentTab.body && currentTab.body.trim()) {
        try {
          requestBody = JSON.parse(currentTab.body);
        } catch (parseError) {
          updateCurrentTab({ error: { message: 'Invalid JSON: ' + parseError.message }, loading: false });
          return;
        }
      }

      const config = {
        method: currentTab.method,
        url: finalUrl,
        headers: headersObject,
        data: requestBody
      };

      const result = await axios(config);
      
      updateCurrentTab({
        response: {
          status: result.status,
          statusText: result.statusText,
          data: result.data
        },
        error: null,
        loading: false
      });

    } catch (err) {
      updateCurrentTab({
        error: {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data
        },
        response: null,
        loading: false
      });
    }
  };

  // ============ CLEAR ALL FIELDS IN CURRENT TAB ============
  const clearCurrentTab = () => {
    updateCurrentTab({
      method: 'GET',
      url: '',
      body: '',
      parameters: [],
      headers: [{ id: Date.now(), key: 'Content-Type', value: 'application/json' }],
      response: null,
      error: null
    });
  };

  // ============ SAVE CURRENT REQUEST TO COLLECTION ============
  const saveToCollection = () => {
    setShowNewCollectionDialog(true);
  };

  const createCollection = () => {
    if (!newCollectionName.trim()) return;
    
    const currentTab = getCurrentTab();
    const newCollection = {
      id: Date.now(),
      name: newCollectionName,
      requests: [{
        id: Date.now(),
        method: currentTab.method,
        url: currentTab.url,
        body: currentTab.body,
        parameters: currentTab.parameters,
        headers: currentTab.headers,
        savedAt: Date.now()
      }]
    };
    
    setCollections(prev => [...prev, newCollection]);
    setNewCollectionName('');
    setShowNewCollectionDialog(false);
  };

  const addToExistingCollection = (collectionId) => {
    const currentTab = getCurrentTab();
    if (!currentTab.url) return;
    
    setCollections(prev => prev.map(collection => {
      if (collection.id === collectionId) {
        return {
          ...collection,
          requests: [...collection.requests, {
            id: Date.now(),
            method: currentTab.method,
            url: currentTab.url,
            body: currentTab.body,
            parameters: currentTab.parameters,
            headers: currentTab.headers,
            savedAt: Date.now()
          }]
        };
      }
      return collection;
    }));
  };

  const loadFromCollection = (request) => {
    updateCurrentTab({
      method: request.method,
      url: request.url,
      body: request.body || '',
      parameters: request.parameters || [],
      headers: request.headers || [{ id: Date.now(), key: 'Content-Type', value: 'application/json' }],
      response: null,
      error: null
    });
  };

  const deleteCollection = (collectionId) => {
    setCollections(prev => prev.filter(c => c.id !== collectionId));
  };

  const deleteRequestFromCollection = (collectionId, requestId) => {
    setCollections(prev => prev.map(collection => {
      if (collection.id === collectionId) {
        return {
          ...collection,
          requests: collection.requests.filter(r => r.id !== requestId)
        };
      }
      return collection;
    }).filter(collection => collection.requests.length > 0));
  };

  // ============ EXPORT COLLECTION ============
  const exportCollection = (collection) => {
    const dataStr = JSON.stringify(collection, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${collection.name}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // ============ IMPORT COLLECTION ============
  const importCollection = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (imported.name && imported.requests) {
            const newCollection = {
              ...imported,
              id: Date.now(),
              requests: imported.requests.map(r => ({ ...r, id: Date.now() + Math.random() }))
            };
            setCollections(prev => [...prev, newCollection]);
          } else {
            alert('Invalid collection file format');
          }
        } catch (error) {
          alert('Error parsing JSON file');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  const currentTab = getCurrentTab();
  const isJsonValid = currentTab?.body ? (() => {
    if (!currentTab.body.trim()) return true;
    try { JSON.parse(currentTab.body); return true; }
    catch { return false; }
  })() : true;

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <header className="app-header">
        <h1>🚀 API Tester</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => document.getElementById('import-file').click()} className="import-btn-header">
            📥 Import Collection
          </button>
          <input
            type="file"
            id="import-file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={importCollection}
          />
          <button onClick={saveToCollection} className="save-collection-btn">
            💾 Save to Collection
          </button>
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className="theme-toggle"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>
      
      <div className="app-content">
        <aside className="sidebar">
          <div className="collections-section">
            <h3>📚 Collections ({collections.length})</h3>
            <div className="collections-list">
              {collections.map(collection => (
                <div key={collection.id} className="collection-item">
                  <div className="collection-header">
                    <span className="collection-name">📁 {collection.name}</span>
                    <div className="collection-buttons">
                      <button onClick={() => exportCollection(collection)} className="export-collection-btn" title="Export">📤</button>
                      <button onClick={() => deleteCollection(collection.id)} className="delete-collection-btn" title="Delete">🗑️</button>
                    </div>
                  </div>
                  <div className="collection-requests">
                    {collection.requests && collection.requests.map((req) => (
                      <div key={req.id} className="collection-request" onClick={() => loadFromCollection(req)}>
                        <span className={`method-mini method-${req.method.toLowerCase()}`}>{req.method}</span>
                        <span className="request-url-mini">{req.url?.substring(0, 40)}...</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteRequestFromCollection(collection.id, req.id); }}
                          className="remove-request-btn"
                        >×</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {collections.length === 0 && (
                <p className="empty-message">📭 No collections yet.<br/>Click "Save to Collection" to create one.</p>
              )}
            </div>
          </div>

          {collections.length > 0 && (
            <div className="add-to-collection">
              <h3>➕ Add current request to:</h3>
              <select onChange={(e) => addToExistingCollection(parseInt(e.target.value))} defaultValue="">
                <option value="" disabled>Select collection...</option>
                {collections.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
        </aside>
        
        <main className="main-content">
          <div className="tabs-container">
            <div className="tabs-header">
              {tabs.map(tab => (
                <div
                  key={tab.id}
                  className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
                  onClick={() => setActiveTabId(tab.id)}
                >
                  <span className="tab-method">{tab.method}</span>
                  <span className="tab-url">{tab.url?.substring(0, 30) || 'New Request'}</span>
                  {tabs.length > 1 && (
                    <button
                      className="close-tab"
                      onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                    >×</button>
                  )}
                </div>
              ))}
              <button onClick={createNewTab} className="add-tab-btn">+ New Tab</button>
            </div>
          </div>

          {currentTab && (
            <form onSubmit={(e) => { e.preventDefault(); sendRequest(); }} className="request-form">
              <div className="request-line">
                <select 
                  value={currentTab.method} 
                  onChange={(e) => updateCurrentTab({ method: e.target.value })} 
                  className="method-select"
                >
                  {methods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="Enter URL (e.g., https://jsonplaceholder.typicode.com/posts/1)"
                  value={currentTab.url}
                  onChange={(e) => updateCurrentTab({ url: e.target.value })}
                  className="url-input"
                />
                <button type="submit" disabled={currentTab.loading} className="send-btn">
                  {currentTab.loading ? '⏳ Sending...' : '📤 Send'}
                </button>
                <button type="button" onClick={clearCurrentTab} className="clear-btn">🗑️ Clear</button>
              </div>
              
              <div className="parameters-panel">
                <div className="panel-header">
                  <h3>🔧 Query Parameters</h3>
                  <button type="button" onClick={() => updateCurrentTab({ 
                    parameters: [...currentTab.parameters, { id: Date.now(), key: '', value: '' }] 
                  })} className="add-btn">+ Add</button>
                </div>
                {currentTab.parameters.map(param => (
                  <div key={param.id} className="param-row">
                    <input 
                      placeholder="Key" 
                      value={param.key} 
                      onChange={(e) => updateCurrentTab({
                        parameters: currentTab.parameters.map(p => 
                          p.id === param.id ? { ...p, key: e.target.value } : p
                        )
                      })}
                    />
                    <input 
                      placeholder="Value" 
                      value={param.value} 
                      onChange={(e) => updateCurrentTab({
                        parameters: currentTab.parameters.map(p => 
                          p.id === param.id ? { ...p, value: e.target.value } : p
                        )
                      })}
                    />
                    <button type="button" onClick={() => updateCurrentTab({
                      parameters: currentTab.parameters.filter(p => p.id !== param.id)
                    })} className="remove-btn">×</button>
                  </div>
                ))}
                {currentTab.parameters.length === 0 && <p className="empty-message">No parameters</p>}
              </div>
              
              <div className="headers-panel">
                <div className="panel-header">
                  <h3>📋 Headers</h3>
                  <button type="button" onClick={() => updateCurrentTab({ 
                    headers: [...currentTab.headers, { id: Date.now(), key: '', value: '' }] 
                  })} className="add-btn">+ Add</button>
                </div>
                {currentTab.headers.map(header => (
                  <div key={header.id} className="header-row">
                    <input 
                      placeholder="Header Name" 
                      value={header.key} 
                      onChange={(e) => updateCurrentTab({
                        headers: currentTab.headers.map(h => 
                          h.id === header.id ? { ...h, key: e.target.value } : h
                        )
                      })}
                    />
                    <input 
                      placeholder="Header Value" 
                      value={header.value} 
                      onChange={(e) => updateCurrentTab({
                        headers: currentTab.headers.map(h => 
                          h.id === header.id ? { ...h, value: e.target.value } : h
                        )
                      })}
                    />
                    <button type="button" onClick={() => updateCurrentTab({
                      headers: currentTab.headers.filter(h => h.id !== header.id)
                    })} className="remove-btn">×</button>
                  </div>
                ))}
              </div>
              
              {(currentTab.method === 'POST' || currentTab.method === 'PUT' || currentTab.method === 'PATCH') && (
                <div className="body-section">
                  <label>📝 Request Body (JSON) {!isJsonValid && currentTab.body && <span style={{color: 'red'}}>⚠️ Invalid JSON</span>}</label>
                  <textarea
                    value={currentTab.body}
                    onChange={(e) => updateCurrentTab({ body: e.target.value })}
                    placeholder='{"key": "value"}'
                    className={`body-textarea ${!isJsonValid && currentTab.body ? 'error' : ''}`}
                    rows={6}
                  />
                </div>
              )}
            </form>
          )}
          
          <div className="response-panel">
            <div className="response-header">
              {currentTab?.response && (
                <div className={`status-code ${currentTab.response.status >= 200 && currentTab.response.status < 300 ? 'success' : ''}`}>
                  ✅ Status: {currentTab.response.status} {currentTab.response.statusText}
                </div>
              )}
              {currentTab?.error && (
                <div className="status-code client-error">
                  ❌ Error: {currentTab.error.status || ''} {currentTab.error.message}
                </div>
              )}
            </div>
            <div className="response-content">
              {currentTab?.loading && (
                <div className="loading-spinner-container">
                  <div className="loading-spinner"></div>
                  <p>⏳ Loading...</p>
                </div>
              )}
              {currentTab?.response && !currentTab.loading && (
                <pre className="response-body">
                  {JSON.stringify(currentTab.response.data, null, 2)}
                </pre>
              )}
              {currentTab?.error && !currentTab.loading && (
                <pre className="response-body error-text">
                  {JSON.stringify(currentTab.error.data || currentTab.error.message, null, 2)}
                </pre>
              )}
              {!currentTab?.response && !currentTab?.error && !currentTab?.loading && (
                <p>💡 No response yet. Send a request to see results.</p>
              )}
            </div>
          </div>
        </main>
      </div>

      {showNewCollectionDialog && (
        <div className="modal-overlay" onClick={() => setShowNewCollectionDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>💾 Save to New Collection</h3>
            <input
              type="text"
              placeholder="Enter collection name..."
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && createCollection()}
            />
            <div className="modal-buttons">
              <button onClick={createCollection}>Create</button>
              <button onClick={() => setShowNewCollectionDialog(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;