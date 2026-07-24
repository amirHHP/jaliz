// Jaliz Service Worker — multi-cache strategies for a more local-app feel
const SHELL_CACHE = 'jaliz-shell-v3'
const STATIC_CACHE = 'jaliz-static-v3'
const PAGES_CACHE = 'jaliz-pages-v3'
const IMAGE_CACHE = 'jaliz-images-v3'

const ALL_CACHES = [SHELL_CACHE, STATIC_CACHE, PAGES_CACHE, IMAGE_CACHE]
const CACHE_PREFIX = 'jaliz-'

const NETWORK_TIMEOUT_MS = 2500
const MAX_IMAGE_ENTRIES = 60

const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  '/hero-character.jpg',
  '/marketplace',
  '/login',
  '/plants/diagnose',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] precache failed:', url, err)
          }),
        ),
      ),
    ),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name.startsWith(CACHE_PREFIX) && !ALL_CACHES.includes(name))
          .map((name) => caches.delete(name)),
      ),
    ),
  )
  self.clients.claim()
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return

  if (request.mode === 'navigate') {
    event.respondWith(staleWhileRevalidatePage(event, request))
    return
  }

  if (isImmutableStatic(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  if (isImageRequest(request, url)) {
    event.respondWith(cacheFirstWithLimit(request, IMAGE_CACHE, MAX_IMAGE_ENTRIES))
    return
  }

  event.respondWith(networkFirstWithTimeout(request, PAGES_CACHE, NETWORK_TIMEOUT_MS))
})

function isImmutableStatic(url) {
  if (url.pathname.startsWith('/_next/static/')) return true
  if (url.pathname.startsWith('/icons/')) return true
  if (url.pathname.startsWith('/screenshots/')) return true
  if (/\.(?:woff2?|ttf|otf|eot)$/i.test(url.pathname)) return true
  if (
    url.pathname === '/manifest.json' ||
    url.pathname === '/hero-character.jpg' ||
    url.pathname === '/offline.html'
  ) {
    return true
  }
  return false
}

function isImageRequest(request, url) {
  if (request.destination === 'image') return true
  return /\.(?:png|jpe?g|gif|webp|svg|avif|ico)$/i.test(url.pathname)
}

async function staleWhileRevalidatePage(event, request) {
  const cache = await caches.open(PAGES_CACHE)
  const cached = await cache.match(request)

  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => null)

  if (cached) {
    event.waitUntil(networkPromise)
    return cached
  }

  const networkResponse = await networkPromise
  if (networkResponse) return networkResponse

  const shell = await caches.open(SHELL_CACHE)
  return (
    (await shell.match(request)) ||
    (await shell.match('/')) ||
    (await shell.match('/offline.html')) ||
    new Response('Offline', { status: 503, statusText: 'Offline' })
  )
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response && response.status === 200) {
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return (
      (await caches.match(request)) ||
      new Response('Offline', { status: 503, statusText: 'Offline' })
    )
  }
}

async function cacheFirstWithLimit(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response && response.status === 200) {
      await cache.put(request, response.clone())
      await trimCache(cache, maxEntries)
    }
    return response
  } catch {
    return (
      (await cache.match(request)) ||
      new Response('', { status: 503, statusText: 'Offline' })
    )
  }
}

async function networkFirstWithTimeout(request, cacheName, timeoutMs) {
  const cache = await caches.open(cacheName)

  try {
    const response = await Promise.race([
      fetch(request).then((res) => {
        if (res && res.status === 200) {
          cache.put(request, res.clone())
        }
        return res
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), timeoutMs),
      ),
    ])
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    return (
      (await caches.match(request)) ||
      new Response('Offline', { status: 503, statusText: 'Offline' })
    )
  }
}

async function trimCache(cache, maxEntries) {
  const keys = await cache.keys()
  if (keys.length <= maxEntries) return
  const toDelete = keys.length - maxEntries
  for (let i = 0; i < toDelete; i++) {
    await cache.delete(keys[i])
  }
}

self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)
})

self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag)
})

self.addEventListener('push', (event) => {
  const title = 'جالیز'
  const options = {
    body: event.data ? event.data.text() : 'یادآور آبیاری گیاهان شما',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
  }
  event.waitUntil(self.registration.showNotification(title, options))
})
