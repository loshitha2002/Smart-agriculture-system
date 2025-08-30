import React, { useState } from 'react';
import usePWA from '../../hooks/usePWA';
import './PWAStatus.css';

const PWAStatus = () => {
  const {
    isInstallable,
    isInstalled,
    isOnline,
    installApp,
    requestNotificationPermission,
    sendTestNotification,
    syncData
  } = usePWA();

  const [notificationEnabled, setNotificationEnabled] = useState(
    Notification.permission === 'granted'
  );

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationEnabled(granted);
  };

  const handleTestNotification = () => {
    if (notificationEnabled) {
      sendTestNotification();
    } else {
      alert('Please enable notifications first!');
    }
  };

  return (
    <div className="pwa-status">
      <div className="pwa-header">
        <h3>📱 App Status</h3>
        <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
          <div className="status-dot"></div>
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      <div className="pwa-features">
        {/* Installation Status */}
        <div className="feature-item">
          <div className="feature-info">
            <span className="feature-icon">📲</span>
            <div className="feature-text">
              <div className="feature-title">App Installation</div>
              <div className="feature-desc">
                {isInstalled ? 'App is installed' : 'Install for better experience'}
              </div>
            </div>
          </div>
          <div className="feature-action">
            {isInstalled ? (
              <span className="status-badge installed">✅ Installed</span>
            ) : isInstallable ? (
              <button onClick={installApp} className="install-btn">
                Install App
              </button>
            ) : (
              <span className="status-badge not-available">Not Available</span>
            )}
          </div>
        </div>

        {/* Offline Support */}
        <div className="feature-item">
          <div className="feature-info">
            <span className="feature-icon">📡</span>
            <div className="feature-text">
              <div className="feature-title">Offline Support</div>
              <div className="feature-desc">
                {isOnline ? 'Connected - Data syncing' : 'Offline mode active'}
              </div>
            </div>
          </div>
          <div className="feature-action">
            {isOnline ? (
              <button onClick={syncData} className="sync-btn">
                🔄 Sync Now
              </button>
            ) : (
              <span className="status-badge offline">📡 Offline Mode</span>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="feature-item">
          <div className="feature-info">
            <span className="feature-icon">🔔</span>
            <div className="feature-text">
              <div className="feature-title">Push Notifications</div>
              <div className="feature-desc">
                Get alerts for critical farm conditions
              </div>
            </div>
          </div>
          <div className="feature-action">
            {notificationEnabled ? (
              <div className="notification-actions">
                <span className="status-badge enabled">✅ Enabled</span>
                <button onClick={handleTestNotification} className="test-btn">
                  Test
                </button>
              </div>
            ) : (
              <button onClick={handleEnableNotifications} className="enable-btn">
                Enable
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PWA Benefits */}
      <div className="pwa-benefits">
        <h4>📋 PWA Benefits</h4>
        <ul>
          <li>✅ Works offline with cached data</li>
          <li>✅ Install on any device</li>
          <li>✅ Push notifications for alerts</li>
          <li>✅ Fast loading and performance</li>
          <li>✅ Native app-like experience</li>
        </ul>
      </div>

      {!isOnline && (
        <div className="offline-notice">
          <div className="offline-icon">📡</div>
          <div className="offline-text">
            <strong>Offline Mode Active</strong>
            <p>You're viewing cached data. Connect to internet to sync latest information.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWAStatus;
