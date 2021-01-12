  
  const CACHE_NAME = "static-cache-bt-v1";
  const DATA_CACHE_NAME = "data-cache-bt-v1";

  const iconSize =['192' , '512'];
  const iconFiles = iconSize.map(
    (size) => '/icons/icon-${size}x${size}.png'
  )


const FILES_TO_CACHE = [
    "/",
    "/index.js",
    '/favicon.ico',
    "/manifest.webmanifest",
  ].concat(iconFiles);
  
  
// install
  self.addEventListener("install", function (evt) {
    evt.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        console.log("Your files were pre-cached successfully!");
        return cache.addAll(FILES_TO_CACHE);
      })
    );
    self.skipWaiting();
  });
  // activate
  self.addEventListener("activate", function (evt) {
    evt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
    self.clients.claim();
  });
  // fetch
  self.addEventListener("fetch", function (evt) {
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(evt.request)
            .then(response => {
              // the response was ok so clone and store it in cache
              if (response.status === 200) {
                cache.put(evt.request, response.clone());
              }
              return response;
            })
            .catch(err => {
              // Network request failed, try to get it from the cache.
              return cache.match(evt.request);
            });
        }).catch(err => console.log(err))
      );
      return;
    }
    evt.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(evt.request).then(response => {
          return response || fetch(evt.request);
        });
      })
    );
  }); 
