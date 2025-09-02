import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', description: 'Real-time monitoring' },
    { path: '/disease-detection', label: 'AI Detection', icon: '🔬', description: 'Disease analysis' },
    { path: '/irrigation', label: 'Irrigation', icon: '💧', description: 'Smart watering' },
    { path: '/analytics', label: 'Analytics', icon: '📈', description: 'Performance insights' },
    { path: '/weather', label: 'Weather', icon: '🌤️', description: 'Weather intelligence' },
    { path: '/dht22', label: 'DHT22 Sensor', icon: '🌡️', description: 'Temperature & humidity' },
    { path: '/pwa', label: 'Install App', icon: '📱', description: 'Mobile app features' },
    { path: '/demo', label: 'Demo Mode', icon: '🎯', description: 'Hackathon showcase' }
  ];

  return (
    <header className="bg-gradient-primary shadow-2xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-48 translate-x-48"></div>
      
      <div className="container mx-auto px-6 py-4 relative z-10">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 shadow-lg">
              <span className="text-3xl">🌱</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white leading-tight">
                Smart Agriculture
              </h1>
              <p className="text-white/80 text-sm font-medium">
                AI-Powered IoT Assistant
              </p>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                  location.pathname === item.path
                    ? 'bg-white/20 backdrop-blur-sm shadow-lg text-white'
                    : 'hover:bg-white/10 text-white/90 hover:text-white'
                }`}
              >
                <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                  {item.icon}
                </span>
                <div className="hidden md:block">
                  <div className="font-semibold text-sm">{item.label}</div>
                  <div className="text-xs text-white/70">{item.description}</div>
                </div>
                
                {/* Active indicator */}
                {location.pathname === item.path && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg"></div>
                )}
              </Link>
            ))}
          </nav>

          {/* Status Indicator */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">Live</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
