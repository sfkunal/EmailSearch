import React from 'react';
import ListItemText from '@mui/material/ListItemText/index.js';
import Typography from '@mui/material/Typography/index.js';
import ListItem from '@mui/material/ListItem/index.js';


const ResultEmail = ({ searchResult, onClick, index, animationTrigger }) => {
  const truncateBody = (body) => {
    if (!body || body.length <= 150) return body;
    return `${body.substring(0, 150)}...`;
  };

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  };

  return (
    <div className={`result-email fade-in`} style={{ animationDelay: `${index * 100}ms` }} key={animationTrigger}>
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
        <Typography
          component="span"
          variant="body2"
          sx={{
            color: 'text.primary',
            display: 'inline',
            fontSize: '0.8rem',
            whiteSpace: 'nowrap'
          }}
        >
          {formatDate(searchResult.date)}
        </Typography>
      </ListItem>
    </div>
  );
};

export default ResultEmail;