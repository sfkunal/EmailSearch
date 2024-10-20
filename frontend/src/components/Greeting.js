import React from 'react';

function Greeting() {
  const currentTime = new Date().getHours();

  let greeting;
  if (currentTime >= 5 && currentTime < 12) {
    greeting = "Good Morning";
  } else if (currentTime >= 12 && currentTime < 17) {
    greeting = "Good Afternoon";
  } else if (currentTime >= 17 && currentTime < 21) {
    greeting = "Good Evening";
  } else {
    greeting = "Good Night";
  }

  return (
    <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '50px' }}>
      {greeting}, Kunal
    </h1>
  );
}

export default Greeting;