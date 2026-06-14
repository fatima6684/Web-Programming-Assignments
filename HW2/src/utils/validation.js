export const validateUrl = (url) => {
    if (!url || url.trim() === '') {
      return { isValid: false, message: 'URL cannot be empty' };
    }
    
    const urlPattern = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;
    if (!urlPattern.test(url)) {
      return { isValid: false, message: 'Invalid URL. Must start with http:// or https://' };
    }
    
    return { isValid: true, message: '' };
  };
  
  export const validateJsonBody = (body) => {
    if (!body || body.trim() === '') {
      return { isValid: true, message: '' };
    }
    
    try {
      JSON.parse(body);
      return { isValid: true, message: '' };
    } catch (error) {
      return { isValid: false, message: 'Invalid JSON format: ' + error.message };
    }
  };