async function queryLanguageModel(ids, prompt) {
    const baseUrl = 'http://127.0.0.1:5000';
    const endpoint = '/message';

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: ids.join(',').toString(),
          prompt: prompt,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }  
      const result = await response.json();
      return result.response;
    } catch (error) {
      console.error('Error:', error.message);
      return null;
    }
  }
  
  export default queryLanguageModel;