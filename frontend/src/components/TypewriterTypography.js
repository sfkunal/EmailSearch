import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';

const TypewriterTypography = ({ text, variant, delay = 100, ...props }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prevText) => prevText + text[currentIndex]);
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, delay, text]);

  return (
    <Typography variant={variant} {...props}>
      {displayText}
    </Typography>
  );
};

export default TypewriterTypography;