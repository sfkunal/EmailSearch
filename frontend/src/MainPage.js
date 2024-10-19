import React from 'react';
import { useState } from 'react';
import IconButton from "@mui/material/IconButton/index.js";
import TextField from "@mui/material/TextField/index.js";
import Box from "@mui/material/Box/index.js";
import Button from "@mui/material/Button/index.js";
import queryEmails from "./api/queryEmails.js";
import queryLanguageModel from './api/queryLanguageModel.js';
import List from '@mui/material/List/index.js';
import ListItem from '@mui/material/ListItem/index.js';
import Divider from '@mui/material/Divider/index.js';
import ListItemText from '@mui/material/ListItemText/index.js';
import Typography from '@mui/material/Typography/index.js';

const SearchBar = ({ setSearchResults, setLanguageModelResponse }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleClick = async (event) => {
    event.preventDefault();
    const result = await queryEmails(searchQuery);
    setSearchResults(result);
    console.log("received data: ", result);

    if (result) {
      const response = await queryLanguageModel(result.ids, searchQuery);
      console.log("language model response: ", response);
      setLanguageModelResponse(response);
    }
  };

  const handleChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleClick(e);
  };

  return (
    <form className="SearchBar" onSubmit={handleSubmit}>
      <input
        type="text"
          value={searchQuery}
          onChange={handleChange}
          placeholder="Search Mail"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit(e);
            }
          }}
      />
      <button type="submit" style={{
        backgroundColor: "#64758d",
        color: "white",
        border: "none",
        padding: "10px 20px",
        borderRadius: "12px",
        cursor: "pointer",
      }}>
        Search
      </button>
    </form>
  );
};

const ResultEmail = ({ searchResult }) => {
  const truncateBody = (body) => {
    if (!body || body.length <= 150) return body;
    return `${body.substring(0, 150)}...`;
  };
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
                          {` - ${truncateBody(searchResult.body)} `}
                  </React.Fragment>
              }
          />
      </ListItem>
  );
}

function MainPage() {
  const [searchResults, setSearchResults] = useState(null);
  const [languageModelResponse, setLanguageModelResponse] = useState(null);

  const loadImage = () => {
    const img = document.createElement('img');
    img.src = '/scopeLogo.jpg'; 
    img.className = 'topRightImage';
    document.body.appendChild(img);
  };

  React.useEffect(() => {
    loadImage();
  }, []);

  return (
    <div className="MainPage">
      <h1 style={{color: 'white', textAlign: 'center'}}>
        Good Evening, Alex
      </h1>
      
      <SearchBar setSearchResults={setSearchResults} setLanguageModelResponse={setLanguageModelResponse} />
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
      {languageModelResponse && (<p style={{color: 'white', textAlign: 'center'}}>{languageModelResponse}</p>)}
    </div>
  );
}

export default MainPage;
