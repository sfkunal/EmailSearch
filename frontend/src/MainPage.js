import React from 'react';
import { useState } from 'react';
import Box from "@mui/material/Box/index.js";
import List from '@mui/material/List/index.js';
import Divider from '@mui/material/Divider/index.js';
import Typography from '@mui/material/Typography/index.js';
import EmailModal from './EmailModal.js';
import SearchBar from './components/SearchBar.js';
import ResultEmail from './components/ResultEmail.js';
import TypewriterTypography from './components/TypewriterTypography.js';

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
      <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '50px' }}>
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
  <div style={{ maxWidth: '100%', overflow: 'hidden', textAlign: 'left' }}>
    <Box style={{
      backgroundColor: '#E0E0E0',
      borderRadius: '12px',
      marginTop: '25px',
      marginBottom: '25px',
      opacity: '0.6',
      width: 'auto', // Set width to auto
      display: 'inline-block', // Make it inline-block
    }}>
      <TypewriterTypography
        text={languageModelResponse}
        delay={20}
        style={{
          paddingTop: '5px',
          paddingBottom: '5px',
          color: 'black',
          textAlign: 'left',
          marginLeft: '15px',
          marginRight: '15px',
          fontWeight: 'bold',
          fontSize: '20px',
          fontFamily: 'Arial, sans-serif'
        }}
      />
    </Box>
  </div>
)}
      <EmailModal isOpen={!!selectedEmail} onClose={() => setSelectedEmail(null)} content={selectedEmail} />
    </div>
  );
}

export default MainPage;
