const CACHE_NAME = 'smart-agriculture-v1.0.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/dashboard',
  '/weather',
  '/disease-detection',
  '/irrigation',
  '/analytics',
  '/demo'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  console.log('Smart Agriculture SW: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Smart Agriculture SW: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Smart Agriculture SW: Cache failed:', error);
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  console.log('Smart Agriculture SW: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Smart Agriculture SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch Event - Network First, then Cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip Chrome extension requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If we got a response, clone it and store in cache
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try to get from cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            
            // If not in cache, return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            
            // For API requests, return offline data
            if (event.request.url.includes('/api/')) {
              return new Response(JSON.stringify(getOfflineData(event.request.url)), {
                headers: { 'Content-Type': 'application/json' }
              });
            }
            
            return new Response('Offline - No cached version available', {
              status: 404,
              statusText: 'Offline'
            });
          });
      })
  );
});

// Offline data for when network is unavailable
function getOfflineData(url) {
  if (url.includes('/api/sensors')) {
    return {
      soilMoisture: { value: 45, unit: '%', status: 'normal', lastUpdated: new Date().toISOString() },
      temperature: { value: 26, unit: '°C', status: 'normal', lastUpdated: new Date().toISOString() },
      humidity: { value: 68, unit: '%', status: 'normal', lastUpdated: new Date().toISOString() },
      lightIntensity: { value: 850, unit: 'lux', status: 'normal', lastUpdated: new Date().toISOString() },
      offline: true,
      message: 'Offline mode - Cached sensor data'
    };
  }
  
  if (url.includes('/api/weather/current')) {
    return {
      location: { city: 'Colombo', country: 'LK' },
      current: {
        temperature: 28,
        feelsLike: 31,
        humidity: 70,
        pressure: 1013,
        windSpeed: 3.2,
        windDirection: 180,
        visibility: 10,
        uvIndex: 6,
        description: 'partly cloudy',
        icon: '02d',
        cloudCover: 40,
        precipitation: 0
      },
      offline: true,
      message: 'Offline mode - Cached weather data'
    };
  }
  
  if (url.includes('/api/demo/scenarios')) {
    return {
      scenarios: {
        optimal: 'Optimal Growing Conditions',
        drought: 'Drought Emergency',
        disease: 'Disease Outbreak Detection',
        growth: 'Rapid Growth Phase'
      },
      current: 'optimal',
      offline: true,
      message: 'Offline mode - Demo scenarios available'
    };
  }
  
  return {
    offline: true,
    message: 'Offline mode - Limited functionality available'
  };
}

// Background Sync for data when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-sensor-data') {
    event.waitUntil(syncSensorData());
  }
});

async function syncSensorData() {
  try {
    // Sync any pending data when connection is restored
    console.log('Smart Agriculture SW: Syncing data...');
    
    // Here you would typically sync any pending sensor readings,
    // irrigation commands, or other data that was queued while offline
    
    // For now, just clear any old cached API responses
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    
    keys.forEach(async (request) => {
      if (request.url.includes('/api/')) {
        await cache.delete(request);
      }
    });
    
    console.log('Smart Agriculture SW: Data sync completed');
  } catch (error) {
    console.error('Smart Agriculture SW: Sync failed:', error);
  }
}

// Push notifications for alerts
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo.svg',
      badge: '/logo.svg',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || '1'
      },
      actions: [
        {
          action: 'view',
          title: 'View Dashboard',
          icon: '/logo.svg'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/logo.svg'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Smart Agriculture Alert', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('Smart Agriculture Service Worker loaded successfully! 🌱');
