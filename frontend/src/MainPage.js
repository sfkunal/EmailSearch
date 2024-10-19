import React from 'react';
import { useState } from 'react';
import IconButton from "@mui/material/IconButton/index.js";
import TextField from "@mui/material/TextField/index.js";
import Box from "@mui/material/Box/index.js";
import Button from "@mui/material/Button/index.js";
import queryEmails from "./api/queryEmails.js";
import List from '@mui/material/List/index.js';
import ListItem from '@mui/material/ListItem/index.js';
import Divider from '@mui/material/Divider/index.js';
import ListItemText from '@mui/material/ListItemText/index.js';
import Typography from '@mui/material/Typography/index.js';

const SearchBar = ({ searchResults, setSearchResults }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleClick = async (event) => {
    event.preventDefault();
    const result = await queryEmails(searchQuery);
    setSearchResults(result);

    // const data = result?.metadatas;
    console.log("received data: ", result);
    // setSearchResults(data);
  };

  const handleChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="SearchBar">
      <TextField
          id="search-bar"
          value={searchQuery}
          onChange={handleChange}
          label="How can I help you?"
          variant="outlined"
          placeholder="Search Mail"
      />
      <Button variant="contained" color="primary" onClick={handleClick}>
        Submit
      </Button>
    </div>
  );
};

const ResultEmail = ({ searchResult }) => {
  return (
      <ListItem className="ListItem">
          <ListItemText
              primary={searchResult.subject}
              secondary={
                  <React.Fragment>
                      <Typography
                          component="span"
                          variant="body2"
                          sx={{ color: 'text.primary', display: 'inline' }}
                          >
                              {searchResult.to}
                          </Typography>
                          {` - ${searchResult.body}`}
                  </React.Fragment>
              }
          />
      </ListItem>
  );
}

function MainPage() {
  const [searchResults, setSearchResults] = useState(null);

  return (
    <div className="MainPage">
      <h1 style={{color: 'white', textAlign: 'center'}}>
        Good Evening, Alex
      </h1>
      <SearchBar searchResults={searchResults} setSearchResults={setSearchResults} />
      {searchResults?.metadatas && (
          <List className="List">
              {searchResults.metadatas[0].map((result, index) => (
                  <React.Fragment key={index}>
                      <ResultEmail searchResult={result} />
                      <Divider />
                  </React.Fragment>
              ))}
          </List>
      )}
    </div>
  );
}

export default MainPage;
