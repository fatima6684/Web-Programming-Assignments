import { useState } from 'react';
import axios from 'axios';

export const useRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const sendRequest = async (method, url, headers, body, params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const config = {
        method,
        url,
        headers,
        params,
        data: body
      };
      
      const result = await axios(config);
      setResponse({
        status: result.status,
        statusText: result.statusText,
        data: result.data,
        headers: result.headers
      });
      return result;
    } catch (err) {
      const errorResponse = {
        status: err.response?.status || 0,
        statusText: err.response?.statusText || 'Network Error',
        data: err.response?.data || err.message,
        isError: true
      };
      setError(errorResponse);
      setResponse(errorResponse);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearResponse = () => {
    setResponse(null);
    setError(null);
  };

  return { sendRequest, loading, error, response, clearResponse };
};