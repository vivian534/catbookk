// ============================================================
//  sw.js - 自动按需缓存（以后新增 part 文件不用改这里）
// ============================================================

const CACHE_NAME = 'catbook-permanent-v1';

// 安装时只缓存核心框架（让页面秒开）
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/loader.js'
        // 注意：这里不写 part_*.js，让它们按需自动缓存
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

// ===== 核心：拦截所有请求，永久缓存 =====
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // 只缓存同源的 .js 文件（包括 part_1.js ~ part_100.js）
  if (url.origin === location.origin && url.pathname.endsWith('.js')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(request).then(cached => {
          // 如果有缓存，直接返回（永久有效，不问网络）
          if (cached) {
            console.log('✅ 从永久缓存读取:', url.pathname);
            return cached;
          }
          // 如果没有缓存，去网络下载，然后存进缓存（永久保存）
          return fetch(request).then(response => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
              console.log('💾 已永久缓存新文件:', url.pathname);
            }
            return response;
          });
        });
      })
    );
  } else {
    // 其他请求（图片、字体等）走正常缓存策略
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request))
    );
  }
});