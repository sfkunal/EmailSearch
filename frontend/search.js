const searchInput = document.getElementById('search-input');

searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        // Perform search action here
        // console.log('Searching for:', searchInput.value);
        // You can send this value to the main process to perform actions
    } else if (event.key === 'Escape') {
        window.close();
    }
});

// Clear the input when the window is shown
window.addEventListener('focus', () => {
    searchInput.value = '';
});