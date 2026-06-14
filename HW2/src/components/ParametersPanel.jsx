import React from 'react';

const ParametersPanel = ({ parameters, setParameters }) => {
  const addParameter = () => {
    setParameters([
      ...parameters,
      { id: Date.now(), key: '', value: '' }
    ]);
  };

  const updateParameter = (id, field, value) => {
    setParameters(parameters.map(param =>
      param.id === id ? { ...param, [field]: value } : param
    ));
  };

  const removeParameter = (id) => {
    setParameters(parameters.filter(param => param.id !== id));
  };

  return (
    <div className="parameters-panel">
      <div className="panel-header">
        <h3>Query Parameters</h3>
        <button onClick={addParameter} className="add-btn">+ Add Parameter</button>
      </div>
      <div className="parameters-list">
        {parameters.map(param => (
          <div key={param.id} className="param-row">
            <input
              type="text"
              placeholder="Key"
              value={param.key}
              onChange={(e) => updateParameter(param.id, 'key', e.target.value)}
              className="param-key"
            />
            <input
              type="text"
              placeholder="Value"
              value={param.value}
              onChange={(e) => updateParameter(param.id, 'value', e.target.value)}
              className="param-value"
            />
            <button onClick={() => removeParameter(param.id)} className="remove-btn">×</button>
          </div>
        ))}
      </div>
      {parameters.length === 0 && (
        <p className="empty-message">No parameters added. Click "Add Parameter" to add query parameters.</p>
      )}
    </div>
  );
};

export default ParametersPanel;