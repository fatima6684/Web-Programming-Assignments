import React, { useState } from 'react';

const CollectionsPanel = ({ collections, onSaveCollection, onLoadCollection, onDeleteCollection }) => {
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      onSaveCollection(newCollectionName.trim());
      setNewCollectionName('');
      setShowCreateForm(false);
    }
  };
  
  const handleExportCollection = (collection) => {
    const dataStr = JSON.stringify(collection, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${collection.name}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  const handleImportCollection = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const collection = JSON.parse(e.target.result);
          onSaveCollection(collection.name, collection.requests);
        } catch (error) {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };
  
  if (collections.length === 0 && !showCreateForm) {
    return (
      <div className="collections-panel">
        <div className="panel-header">
          <h3>Collections</h3>
          <button onClick={() => setShowCreateForm(true)} className="add-btn">+ New Collection</button>
        </div>
        <p className="empty-message">No collections yet. Create one to save your requests.</p>
      </div>
    );
  }
  
  return (
    <div className="collections-panel">
      <div className="panel-header">
        <h3>Collections</h3>
        <div className="collection-actions">
          <input
            type="file"
            accept=".json"
            onChange={handleImportCollection}
            style={{ display: 'none' }}
            id="import-file"
          />
          <label htmlFor="import-file" className="import-btn">Import</label>
          <button onClick={() => setShowCreateForm(true)} className="add-btn">+ New</button>
        </div>
      </div>
      
      {showCreateForm && (
        <div className="create-collection-form">
          <input
            type="text"
            placeholder="Collection name"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
          />
          <button onClick={handleCreateCollection}>Create</button>
          <button onClick={() => setShowCreateForm(false)}>Cancel</button>
        </div>
      )}
      
      <div className="collections-list">
        {collections.map(collection => (
          <div key={collection.id} className="collection-item">
            <div className="collection-header">
              <span className="collection-name">{collection.name}</span>
              <div className="collection-buttons">
                <button onClick={() => handleExportCollection(collection)} className="export-btn">Export</button>
                <button onClick={() => onDeleteCollection(collection.id)} className="delete-collection-btn">Delete</button>
              </div>
            </div>
            {collection.requests && collection.requests.length > 0 && (
              <div className="collection-requests">
                {collection.requests.map((request, idx) => (
                  <div key={idx} className="collection-request" onClick={() => onLoadCollection(request)}>
                    <span className={`method-mini method-${request.method.toLowerCase()}`}>
                      {request.method}
                    </span>
                    <span className="request-url-mini">{request.url}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollectionsPanel;