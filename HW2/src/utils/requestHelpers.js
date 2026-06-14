export const buildUrlWithParams = (baseUrl, params) => {
    if (!params || params.length === 0) return baseUrl;
    
    const validParams = params.filter(p => p.key && p.key.trim() !== '');
    if (validParams.length === 0) return baseUrl;
    
    try {
      const url = new URL(baseUrl);
      validParams.forEach(param => {
        url.searchParams.append(param.key, param.value || '');
      });
      return url.toString();
    } catch (error) {
      console.error("Error building URL:", error);
      return baseUrl;
    }
  };
  
  export const parseParamsFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const params = [];
      urlObj.searchParams.forEach((value, key) => {
        params.push({ key, value, id: Date.now() + Math.random() });
      });
      return { baseUrl: urlObj.origin + urlObj.pathname, params };
    } catch {
      return { baseUrl: url, params: [] };
    }
  };