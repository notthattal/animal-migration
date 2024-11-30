import React, { useEffect, useRef } from 'react';
import Navbar from './components/Navigation/Navbar';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ResearchPage from './components/Pages/ResearchPage';
import ApplicationPage from './components/Pages/ApplicationPage';
import HomePage from './components/Pages/HomePage';
import AboutPage from './components/Pages/AboutPage';

const App = () => {
  

  return (
    <Router>
      <div className="flex flex-col h-screen">
        <Navbar />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/application" element={<ApplicationPage />} />
          <Route path="/research" element={<ResearchPage />} />
        </Routes>
      </div>
  
    </Router>
      
  );
};

export default App;