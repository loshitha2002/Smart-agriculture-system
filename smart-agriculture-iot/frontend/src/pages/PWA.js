import React from 'react';
import PWAStatus from '../components/PWA/PWAStatus';
import './PWA.css';

const PWA = () => {
  return (
    <div className="pwa-page">
      <div className="pwa-page-header">
        <h1>📱 Progressive Web App</h1>
        <p className="pwa-subtitle">
          Install Smart Agriculture on your device for the best mobile experience
        </p>
      </div>
      
      <PWAStatus />
      
      <div className="pwa-info">
        <div className="info-grid">
          <div className="info-card">
            <div className="info-icon">📲</div>
            <h3>Install Anywhere</h3>
            <p>Install directly from your browser on any device - Android, iOS, Windows, Mac, or Linux.</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon">📡</div>
            <h3>Works Offline</h3>
            <p>Access your farm data even without internet connection using cached information.</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon">🔔</div>
            <h3>Push Notifications</h3>
            <p>Get instant alerts for critical farm conditions, weather warnings, and system updates.</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Optimized performance with instant loading and smooth interactions.</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon">🔄</div>
            <h3>Auto Sync</h3>
            <p>Automatically synchronizes data when connection is restored after being offline.</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon">🏠</div>
            <h3>Home Screen</h3>
            <p>Add to your device's home screen for quick access like a native mobile app.</p>
          </div>
        </div>
      </div>

      <div className="installation-guide">
        <h2>📋 Installation Guide</h2>
        
        <div className="guide-sections">
          <div className="guide-section">
            <h3>🤖 Android</h3>
            <ol>
              <li>Open the app in Chrome browser</li>
              <li>Look for the "Install" button in the address bar</li>
              <li>Tap "Install" and confirm</li>
              <li>App will be added to your home screen</li>
            </ol>
          </div>
          
          <div className="guide-section">
            <h3>🍎 iOS</h3>
            <ol>
              <li>Open the app in Safari browser</li>
              <li>Tap the Share button (square with arrow)</li>
              <li>Select "Add to Home Screen"</li>
              <li>Confirm by tapping "Add"</li>
            </ol>
          </div>
          
          <div className="guide-section">
            <h3>💻 Desktop</h3>
            <ol>
              <li>Open the app in Chrome, Edge, or Firefox</li>
              <li>Click the install icon in the address bar</li>
              <li>Click "Install" in the popup</li>
              <li>App will open in its own window</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="pwa-features">
        <h2>🚀 PWA Features</h2>
        <div className="features-list">
          <div className="feature-item">
            <span className="feature-bullet">✅</span>
            <span>Responsive design works on all screen sizes</span>
          </div>
          <div className="feature-item">
            <span className="feature-bullet">✅</span>
            <span>Secure HTTPS connection</span>
          </div>
          <div className="feature-item">
            <span className="feature-bullet">✅</span>
            <span>Service Worker for offline functionality</span>
          </div>
          <div className="feature-item">
            <span className="feature-bullet">✅</span>
            <span>Web App Manifest for installability</span>
          </div>
          <div className="feature-item">
            <span className="feature-bullet">✅</span>
            <span>Background sync for data consistency</span>
          </div>
          <div className="feature-item">
            <span className="feature-bullet">✅</span>
            <span>Push notifications for real-time alerts</span>
          </div>
          <div className="feature-item">
            <span className="feature-bullet">✅</span>
            <span>App shortcuts for quick navigation</span>
          </div>
          <div className="feature-item">
            <span className="feature-bullet">✅</span>
            <span>Native app-like experience</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWA;
