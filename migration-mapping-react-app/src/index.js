// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import esriConfig from "@arcgis/core/config";

// Configure the API key if you have one
// If not, you can remove this line
esriConfig.apiKey = process.env.REACT_APP_ARCGIS_API_KEY;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);