import React from 'react';
import { useState } from 'react';
import TextField from "@mui/material/TextField/index.js";
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
    <div className="SearchBar">
      <input
        type="text"
        id="search-bar"
        value={searchQuery}
        onChange={handleChange}
        placeholder="How can I help you?"
      />
      <Button variant="contained" color="primary" onClick={handleClick}>
        Submit
      </Button>
    </div>
  );
};

function MainPage() {
  const [searchResults, setSearchResults] = useState([]);

  return (
    <div className="MainPage">
      <h1 style={{color: 'white', textAlign: 'center'}}>
        Good Evening, Alex!
      </h1>
      <SearchBar searchResults={searchResults} setSearchResults={setSearchResults} />
      {/* Add more components and content here */}
    </div>
  );
}

export default MainPage;