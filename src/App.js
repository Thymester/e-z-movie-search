import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import About from './components/About';
import Footer from './components/Footer';
import ModernPage from './components/ModernPage';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/modernpage" element={<ModernPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
