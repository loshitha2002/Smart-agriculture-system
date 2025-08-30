import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import components (we'll create these)
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard';
import DiseaseDetection from './pages/DiseaseDetection';
import IrrigationControl from './pages/IrrigationControl';
import Analytics from './pages/Analytics';
import Demo from './pages/Demo';
import Weather from './pages/Weather';
import PWA from './pages/PWA';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/disease-detection" element={<DiseaseDetection />} />
            <Route path="/irrigation" element={<IrrigationControl />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/pwa" element={<PWA />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
