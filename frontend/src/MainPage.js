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
import EmailModal from './EmailModal.js';

const SearchBar = ({ setSearchResults, setLanguageModelResponse }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [position, setPosition] = useState('top');
  const [isVisible, setIsVisible] = useState(true);

  const handleClick = async (event) => {
    event.preventDefault();
    if (position === 'top') {
      setIsVisible(false);
      setTimeout(() => {
        setPosition('bottom');
        setIsVisible(true);
      }, 500); // This should match the transition duration in CSS
    }
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
    <form className={`SearchBar ${position} ${isVisible ? 'visible' : 'hidden'}`} onSubmit={handleSubmit}>
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

const ResultEmail = ({ searchResult, onClick, index, animationTrigger }) => {
  const truncateBody = (body) => {
    if (!body || body.length <= 150) return body;
    return `${body.substring(0, 150)}...`;
  };
  
  return (
    <div className={`result-email fade-in`} style={{animationDelay: `${index * 100}ms`}} key={animationTrigger}>
      <ListItem 
        alignItems="flex-start"
        onClick={onClick}
      >
        <ListItemText
          primary={searchResult.subject}
          secondary={
            <React.Fragment>
              <Typography
                component="span"
                variant="body2"
                sx={{ color: 'text.primary', display: 'inline' }}
              >
                {searchResult.from}
              </Typography>
              {` - ${truncateBody(searchResult.body)} `}
            </React.Fragment>
          }
        />
      </ListItem>
    </div>
  );
};

function MainPage() {
  const [searchResults, setSearchResults] = useState(null);
  const [languageModelResponse, setLanguageModelResponse] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [animationTrigger, setAnimationTrigger] = useState(0);

  const handleEmailClick = (email) => {
    console.log('Clicked email:', email);
    setSelectedEmail(email);
  };

  const loadImage = () => {
    const img = document.createElement('img');
    img.src = '/scopeLogo.jpg';
    img.className = 'topRightImage';
    document.body.appendChild(img);
  };

  React.useEffect(() => {
    loadImage();
  }, []);

  React.useEffect(() => {
    if (searchResults) {
      setAnimationTrigger(prev => prev + 1);
    }
  }, [searchResults]);

  return (
    <div className="MainPage">
      <h1 style={{ color: 'white', textAlign: 'center' }}>
        Good Evening, Alex
      </h1>

      <SearchBar setSearchResults={setSearchResults} setLanguageModelResponse={setLanguageModelResponse} />

      {searchResults?.metadatas && (
        searchResults.distances[0]?.some(distance => distance <= 0.65) ? (
          <List className="List">
            {searchResults.distances[0]?.filter((distance, index) => distance <= 0.65).map((distance, index) => {
              return (
                <React.Fragment key={index}>
                  <ResultEmail 
                    searchResult={searchResults.metadatas[0][index]}
                    onClick={() => handleEmailClick(searchResults.metadatas[0][index])}
                    index={index}
                    animationTrigger={animationTrigger}
                  />
                  <Divider />
                </React.Fragment>
              );
            })}
          </List>
        ) : null
      )}
      {languageModelResponse && (
        <Box style={{
          backgroundColor: '#E0E0E0',
          borderRadius: '12px',
          marginTop: '25px',
          marginBottom: '25px',
          opacity: '0.6'
        }}>
          <Typography style={{
            paddingTop: '5px',
            paddingBottom: '5px',
            color: 'black',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif'
          }}>
            {languageModelResponse}
          </Typography>
        </Box>
      )}
      <EmailModal isOpen={!!selectedEmail} onClose={() => setSelectedEmail(null)} content={selectedEmail} />
    </div>
  );
}

export default MainPage;
