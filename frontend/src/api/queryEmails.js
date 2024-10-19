async function queryEmails(query) {
    const baseUrl = 'http://127.0.0.1:5000';
    const endpoint = '/result';
    const params = new URLSearchParams({ query });

    try {
        const response = await fetch(`${baseUrl}${endpoint}?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}

export default queryEmails;