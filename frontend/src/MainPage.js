import React from 'react';
import { useState } from 'react';
import IconButton from "@mui/material/IconButton/index.js";
import TextField from "@mui/material/TextField/index.js";
import Box from "@mui/material/Box/index.js"
import Button from "@mui/material/Button/index.js";
import queryEmails from "./api/queryEmails.js";

const SearchBar = ({ searchResults, setSearchResults }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleClick = async (event) => {
    event.preventDefault();
    const result = await queryEmails(searchQuery);
    const data = result?.metadatas;
    console.log("received data: ", data);
    setSearchResults(data);
  };

  const handleChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <Box sx={{ flexGrow: 1, margin: 2 }}>
      <TextField
        id="search-bar"
        className="text"
        value={searchQuery}
        onChange={handleChange}
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
      <Button variant="contained" color="primary" type="button" onClick={handleClick}>
        Submit
      </Button>
    </Box>
  );
}

function MainPage() {
  const [searchResults, setSearchResults] = useState([]);

  return (
    <div>
      <h1>Welcome to Your Electron React App</h1>
      <SearchBar searchResults={searchResults} setSearchResults={setSearchResults} />
      {/* Add more components and content here */}
    </div>
  );
}

export default MainPage;