const CACHE_NAME = "pregnancy-pwa-v4";

const FILES_TO_CACHE = [
     "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png",
    "./apple-touch-icon.png"
];

// インストール時に基本ファイルを保存
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

// 古いキャッシュを削除
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(name => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

// 通信できるときは最新版を取得。
// 通信できないときはキャッシュを使用。
self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {

                const responseCopy = response.clone();

                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseCopy);
                });

                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});