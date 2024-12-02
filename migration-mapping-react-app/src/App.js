import React from 'react';
import Navbar from './components/Navigation/Navbar';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
                    {/* Redirect root to /animalmigration */}
                    <Route path="/" element={<Navigate to="/animalmigration" replace />} />

                    {/* Main routes */}
                    <Route path="/animalmigration" element={<HomePage />} />
                    <Route path="/animalmigration/application" element={<ApplicationPage />} />

                    {/* Catch-all redirect */}
                    <Route path="*" element={<Navigate to="/animalmigration" replace />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;