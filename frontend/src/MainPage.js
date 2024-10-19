import React from 'react';
import { useState } from 'react';
import IconButton from "@mui/material/IconButton/index.js";
import TextField from "@mui/material/TextField/index.js";
import Box from "@mui/material/Box/index.js"

const SearchBar = ({setSearchQuery}) => (
    <Box sx={{ flexGrow: 1, margin: 2}}>
        <form>
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
            <IconButton type="submit" aria-label="search">

            </IconButton>
        </form>
    </Box>
)

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