// App.js
import React from 'react';
import MovieSearch from './components/MovieSearch';
import './App.css';

function App() {
  return (
    <div>
      <h1 className='websiteTitle'>E-Z Movie Search</h1>
      <MovieSearch />
    </div>
  );
}

export default App;
