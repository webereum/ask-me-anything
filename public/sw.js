// Service Worker for Push Notifications
const CACHE_NAME = 'ask-me-anything-v1';
const urlsToCache = [
  '/',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/badge-72x72.png',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  let notificationData = {
    title: 'New Message',
    body: 'You have a new message',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'default',
    data: {},
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = { ...notificationData, ...payload };
    } catch (error) {
      console.error('Error parsing push data:', error);
      notificationData.body = event.data.text();
    }
  }

  const notificationOptions = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    data: notificationData.data,
    actions: notificationData.actions || [],
    requireInteraction: notificationData.requireInteraction || false,
    silent: notificationData.silent || false,
    vibrate: [200, 100, 200],
    timestamp: Date.now(),
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationOptions)
  );
});

// Notification click event - handle user interactions
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  // Handle different actions
  if (action === 'reply') {
    // Open reply interface
    event.waitUntil(
      clients.openWindow(`/chat?reply=${data.roomName || data.senderName}`)
    );
  } else if (action === 'view') {
    // Open chat room
    event.waitUntil(
      clients.openWindow(`/chat/${data.roomName || ''}`)
    );
  } else if (action === 'accept') {
    // Handle room invite acceptance
    event.waitUntil(
      handleRoomInviteAction(data, 'accept')
    );
  } else if (action === 'decline') {
    // Handle room invite decline
    event.waitUntil(
      handleRoomInviteAction(data, 'decline')
    );
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Check if app is already open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes('/chat') && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if app is not open
        if (clients.openWindow) {
          const url = data.type === 'direct_message' 
            ? `/chat/dm/${data.senderName}`
            : data.type === 'thread_reply' || data.type === 'thread_like'
            ? `/threads`
            : `/chat/${data.roomName || ''}`;
          
          return clients.openWindow(url);
        }
      })
    );
  }
});

// Background sync for offline message sending
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event);

  if (event.tag === 'send-messages') {
    event.waitUntil(sendPendingMessages());
  }
});

// Handle room invite actions
async function handleRoomInviteAction(data, action) {
  try {
    const response = await fetch('/api/room-invites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        roomName: data.roomName,
        inviterName: data.inviterName,
      }),
    });

    if (response.ok) {
      // Show success notification
      self.registration.showNotification(
        action === 'accept' ? 'Invitation Accepted' : 'Invitation Declined',
        {
          body: action === 'accept' 
            ? `You joined "${data.roomName}"`
            : `You declined the invitation to "${data.roomName}"`,
          icon: '/icons/icon-192x192.png',
          tag: `invite-response-${data.roomName}`,
        }
      );

      // Open chat room if accepted
      if (action === 'accept') {
        clients.openWindow(`/chat/${data.roomName}`);
      }
    }
  } catch (error) {
    console.error('Error handling room invite action:', error);
  }
}

// Send pending messages when back online
async function sendPendingMessages() {
  try {
    // Get pending messages from IndexedDB
    const pendingMessages = await getPendingMessages();
    
    for (const message of pendingMessages) {
      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });

        if (response.ok) {
          // Remove from pending messages
          await removePendingMessage(message.id);
        }
      } catch (error) {
        console.error('Error sending pending message:', error);
      }
    }
  } catch (error) {
    console.error('Error in sendPendingMessages:', error);
  }
}

// IndexedDB helpers for offline message storage
async function getPendingMessages() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ChatDB', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingMessages'], 'readonly');
      const store = transaction.objectStore('pendingMessages');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('pendingMessages')) {
        db.createObjectStore('pendingMessages', { keyPath: 'id' });
      }
    };
  });
}

async function removePendingMessage(messageId) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ChatDB', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingMessages'], 'readwrite');
      const store = transaction.objectStore('pendingMessages');
      const deleteRequest = store.delete(messageId);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('Service worker received message:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service worker unhandled rejection:', event.reason);
});

console.log('Service Worker loaded successfully');