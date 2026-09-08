// =========================================================
// 妊娠週数アプリ Service Worker
// オフライン動作用
// =========================================================

const CACHE_NAME = "pregnancy-pwa-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json"
];


// =========================================================
// インストール時
// 必要なファイルをiPad/ブラウザ内に保存
// =========================================================

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(
                    FILES_TO_CACHE
                );

            })

    );

    self.skipWaiting();

});


// =========================================================
// 新しいService Workerをすぐ有効化
// =========================================================

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(cacheNames => {

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


// =========================================================
// 通信時
//
// ネットがなくてもキャッシュから読み込む
// =========================================================

self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)
            .then(cachedResponse => {

                if (cachedResponse) {

                    return cachedResponse;

                }

                return fetch(event.request);

            })

    );

});