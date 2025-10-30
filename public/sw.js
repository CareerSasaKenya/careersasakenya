// Service worker to handle routing for SPA
const CACHE_NAME = 'careersasa-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // For navigation requests, always serve index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch('/index.html').catch(() => {
        return new Response('', {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        });
      })
    );
    return;
  }

  // For other requests, use network first strategy
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('', {
        status: 404,
        statusText: 'Not Found'
      });
    })
  );
});