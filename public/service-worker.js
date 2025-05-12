// Service Worker for GudCity Loyalty PWA

const CACHE_NAME = 'gudcity-loyalty-v1';
const STATIC_CACHE_NAME = 'gudcity-static-v1';
const DYNAMIC_CACHE_NAME = 'gudcity-dynamic-v1';
const IMAGE_CACHE_NAME = 'gudcity-images-v1';
const API_CACHE_NAME = 'gudcity-api-v1';

// Resources to precache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
  '/src/main.tsx',
  '/src/index.css'
];

// Image extensions 
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.svg', '.gif', '.webp'];

// Install event - cache static assets
self.addEventListener('install', event => {
  // Skip waiting to update immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Precaching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const currentCaches = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, IMAGE_CACHE_NAME, API_CACHE_NAME];
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
      })
      .then(cachesToDelete => {
        return Promise.all(cachesToDelete.map(cacheToDelete => {
          console.log('[Service Worker] Deleting old cache:', cacheToDelete);
          return caches.delete(cacheToDelete);
        }));
      })
      .then(() => {
        // Claim clients to control them immediately
        return self.clients.claim();
      })
  );
});

// Helper function to determine cache strategy based on request
function getCacheStrategy(request) {
  const url = new URL(request.url);
  const extension = url.pathname.substring(url.pathname.lastIndexOf('.'));
  
  // API requests - network first
  if (url.pathname.includes('/api/')) {
    return {
      cacheName: API_CACHE_NAME,
      strategy: 'network-first',
      maxAge: 60 * 5 // 5 minutes
    };
  }
  
  // Image assets - cache first with long TTL
  if (IMAGE_EXTENSIONS.includes(extension)) {
    return {
      cacheName: IMAGE_CACHE_NAME,
      strategy: 'cache-first',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    };
  }
  
  // JavaScript and CSS - stale while revalidate
  if (extension === '.js' || extension === '.css') {
    return {
      cacheName: STATIC_CACHE_NAME,
      strategy: 'stale-while-revalidate',
      maxAge: 60 * 60 * 24 // 1 day
    };
  }
  
  // HTML - network first
  if (extension === '.html' || url.pathname === '/') {
    return {
      cacheName: STATIC_CACHE_NAME,
      strategy: 'network-first',
      maxAge: 60 * 60 // 1 hour
    };
  }
  
  // Default - dynamic cache
  return {
    cacheName: DYNAMIC_CACHE_NAME,
    strategy: 'stale-while-revalidate',
    maxAge: 60 * 60 * 24 // 1 day
  };
}

// Fetch event - handle caching strategy
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip browser extension requests and chrome-extension requests
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) return;
  
  const cacheStrategy = getCacheStrategy(event.request);
  
  if (cacheStrategy.strategy === 'cache-first') {
    // Cache First Strategy
    event.respondWith(
      caches.open(cacheStrategy.cacheName)
        .then(cache => {
          return cache.match(event.request)
            .then(response => {
              if (response) {
                return response;
              }
              
              // Not in cache, fetch from network, then cache
              return fetch(event.request)
                .then(networkResponse => {
                  if (networkResponse && networkResponse.ok) {
                    const clonedResponse = networkResponse.clone();
                    cache.put(event.request, clonedResponse);
                  }
                  return networkResponse;
                })
                .catch(error => {
                  console.error('[Service Worker] Fetch error:', error);
                  // Could return a fallback here
                });
            });
        })
    );
  } else if (cacheStrategy.strategy === 'network-first') {
    // Network First Strategy
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If we got a valid response, cache it
          if (response && response.ok) {
            const clonedResponse = response.clone();
            caches.open(cacheStrategy.cacheName)
              .then(cache => cache.put(event.request, clonedResponse));
          }
          return response;
        })
        .catch(error => {
          console.log('[Service Worker] Network error, falling back to cache');
          // Network failed, try to get from cache
          return caches.open(cacheStrategy.cacheName)
            .then(cache => cache.match(event.request));
        })
    );
  } else {
    // Stale While Revalidate Strategy
    event.respondWith(
      caches.open(cacheStrategy.cacheName)
        .then(cache => {
          return cache.match(event.request)
            .then(response => {
              const fetchPromise = fetch(event.request)
                .then(networkResponse => {
                  if (networkResponse && networkResponse.ok) {
                    cache.put(event.request, networkResponse.clone());
                  }
                  return networkResponse;
                })
                .catch(error => {
                  console.error('[Service Worker] Fetch error in SWR:', error);
                });
              
              // Return the cached response immediately, or wait for the network response
              return response || fetchPromise;
            });
        })
    );
  }
}); 