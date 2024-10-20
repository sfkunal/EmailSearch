import React from 'react';
import { useState } from 'react';
import Box from "@mui/material/Box/index.js";
import List from '@mui/material/List/index.js';
import Divider from '@mui/material/Divider/index.js';
import EmailModal from './EmailModal.js';
import SearchBar from './components/SearchBar.js';
import ResultEmail from './components/ResultEmail.js';
import TypewriterTypography from './components/TypewriterTypography.js';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { config } from './config.js';
import Greeting from './components/Greeting.js';

function MainPage() {
  const [searchResults, setSearchResults] = useState(null);
  const [languageModelResponse, setLanguageModelResponse] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleEmailClick = (email) => {
    console.log('Clicked email:', email);
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
    loadImage();
  }, []);

  React.useEffect(() => {
    if (searchResults) {
      setAnimationTrigger(prev => prev + 1);
    }
  }, [searchResults]);

  const handleSuccess = (credentialResponse) => {
    console.log("Login Success", credentialResponse);
    setIsAuthenticated(true);
    // fetch('http://localhost:5000/auth/google', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ credential: credentialResponse.credential, clientId: credentialResponse.clientId }),
    // })
    //   .then(response => response.json())
    //   .then(data => {
    //     console.log('Success:', data);
    //   })
    //   .catch((error) => {
    //     console.error('Error:', error);
    //   });
  };

  const handleError = () => {
    console.log('Login Failed');
  };

  return (

    <div className="MainPage">
      <Greeting />
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
      {!isAuthenticated && (
        <div className="google-auth-container" style={{
          left: '20px',
          margin: 'auto',
        }}>
          <GoogleOAuthProvider clientId={config.GOOGLE_CLIENT_ID}>
            <div>
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </div>
          </GoogleOAuthProvider>
        </div>
      )}
      <EmailModal isOpen={!!selectedEmail} onClose={() => setSelectedEmail(null)} content={selectedEmail} />
    </div>
  );
}

export default MainPage;
