import React from 'react';
import { useState } from 'react';
import Box from "@mui/material/Box/index.js";
import List from '@mui/material/List/index.js';
import Divider from '@mui/material/Divider/index.js';
import EmailModal from './EmailModal.js';
import SearchBar from './components/SearchBar.js';
import ResultEmail from './components/ResultEmail.js';
import TypewriterTypography from './components/TypewriterTypography.js';
import Greeting from './components/Greeting.js';

function MainPage() {
  const [searchResults, setSearchResults] = useState(null);
  const [languageModelResponse, setLanguageModelResponse] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  const handleEmailClick = (email) => {
    // console.log('Clicked email:', email);
    setSelectedEmail(email);
  };

  const loadImage = () => {
    const img = document.createElement('img');
    img.src = '/scopeLogo.jpg';
    img.className = 'topRightImage';
    img.style.position = 'fixed';
    img.style.top = '20px';
    img.style.right = '20px';
    img.style.zIndex = '9999';
    document.body.appendChild(img);
  };

  React.useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('http://127.0.0.1:5000/is_logged_in');
        const data = await response.json();
        // console.log('Authentication data:', data);
        setIsAuthenticated(data.is_logged_in);
        if (data.is_logged_in) {
          setUserEmail(data.email);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    }
    checkAuth();
  }, []);


  React.useEffect(() => {
    loadImage();
  }, []);

  React.useEffect(() => {
    if (searchResults) {
      setAnimationTrigger(prev => prev + 1);
    }
  }, [searchResults]);

  const handleSuccess = async () => {
    const url = "http://127.0.0.1:5000/login";

    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const open_url = data.url;
      window.open(open_url, '_blank');
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  return (

    <div className="MainPage">
      <Greeting />
      <SearchBar setSearchResults={setSearchResults} setLanguageModelResponse={setLanguageModelResponse} />

      {searchResults?.metadatas && (
        <List className="List">
          {searchResults.metadatas[0].map((metadata, index) => {
            return (
              <React.Fragment key={index}>
                <ResultEmail
                  searchResult={metadata}
                  onClick={() => handleEmailClick(metadata)}
                  index={index}
                  animationTrigger={animationTrigger}
                />
                <Divider />
              </React.Fragment>
            );
          })}
        </List>
      )}
      {languageModelResponse && (
        <div style={{ maxWidth: '100%', overflow: 'hidden', textAlign: 'left' }}>
          <Box style={{
            backgroundColor: '#E0E0E0',
            borderRadius: '12px',
            marginTop: '25px',
            marginBottom: '25px',
            opacity: '0.6',
            width: 'auto',
            display: 'inline-block',
          }}>
            <TypewriterTypography
              text={languageModelResponse}
              delay={30}
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
      {!isAuthenticated ? (
        <div className="google-auth-container" style={{
          left: '5px',
          margin: 'auto',
        }}>
          <img src="loginLogo.png" alt="Login" onClick={() => handleSuccess({ credential: 'fake', clientId: 'fake' })} />
        </div>
      ) : (
        <div className="google-auth-container" style={{
          left: '5px',
          top: '20px',
          margin: 'auto',
        }}>
          <p style={{ color: 'white', fontWeight: 'bold' }}>{userEmail}</p>
        </div>
      )}
      <EmailModal isOpen={!!selectedEmail} onClose={() => setSelectedEmail(null)} content={selectedEmail} />
    </div>
  );
}

export default MainPage;
