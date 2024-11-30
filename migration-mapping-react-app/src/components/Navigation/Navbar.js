import React, { useState } from 'react';
import { Menu, Filter, MapPin } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const Navbar = () => {
    return (
      <nav className="bg-green-800 text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <MapPin className="h-8 w-8" />
          <h1 className="text-xl font-bold">Mozambique Wildlife Migration Tracker</h1>
        </div>
        <div className="flex space-x-4">
            <Link to="/" className="hover:text-green-200">Home</Link>
            <Link to="/about" className="hover:text-green-200">About</Link>
            <Link to="/application" className="hover:text-green-200">Application</Link>
            <Link to="/research" className="hover:text-green-200">Research</Link>
        </div>
      </nav>
    );
};

export default Navbar;
  