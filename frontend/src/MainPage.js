import React from 'react';
import { useState } from 'react';
import IconButton from "@mui/material/IconButton/index.js";
import TextField from "@mui/material/TextField/index.js";
import Box from "@mui/material/Box/index.js"
import Button from "@mui/material/Button/index.js";

const SearchBar = ({ setSearchQuery }) => {
  const handleClick = (event) => {
    event.preventDefault();
    console.log('hello');
  };

  return (
    <Box sx={{ flexGrow: 1, margin: 2 }}>
      <form onSubmit={(e) => handleClick(e)}>
        <TextField
          id="search-bar"
          className="text"
          onInput={(e) => {
            setSearchQuery(e.target.value);
          }}
          label="How can I help you?"
          variant="outlined"
          placeholder="Search Mail"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px',
              backgroundColor: '#f0f0f0',
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: 'transparent',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}
        />
        <IconButton type="button" aria-label="search" onClick={handleClick}>
          {/* Add onClick handler here */}
        </IconButton>
        <Button variant="contained" color="primary" type="button" onClick={handleClick}>
          Submit
        </Button>
      </form>
    </Box>
  );
}

function MainPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div>
      <h1>Welcome to Your Electron React App</h1>
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      {/* Add more components and content here */}
    </div>
  );
}

export default MainPage;