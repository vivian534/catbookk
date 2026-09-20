// ============================================================
//  sw.js - 自动按需缓存（index.html 不走缓存，每次都拿最新）
// ============================================================

const CACHE_NAME = 'catbook-permanent-v2';

// 安装时只缓存 loader.js（不缓存 index.html）
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/loader.js'
      ]);
    }).then(() => self.skipWaiting())
  );
});

// 激活时清理旧版本
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// ===== 核心：拦截所有请求 =====
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // 👈 index.html 和 sw.js 不走缓存，每次都走网络
  if (url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '/sw.js') {
    event.respondWith(fetch(request));
    return;
  }

  // 只缓存同源的 .js 文件（包括 part_1.js ~ part_100.js）
  if (url.origin === location.origin && url.pathname.endsWith('.js')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(request).then(cached => {
          if (cached) {
            return cached;
          }
          return fetch(request).then(response => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          });
        });
      })
    );
  } else {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request))
    );
  }
});
