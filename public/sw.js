// Jaliz Service Worker — multi-cache strategies for a more local-app feel
const SHELL_CACHE = 'jaliz-shell-v5'
const STATIC_CACHE = 'jaliz-static-v5'
const PAGES_CACHE = 'jaliz-pages-v5'
const IMAGE_CACHE = 'jaliz-images-v5'

const ALL_CACHES = [SHELL_CACHE, STATIC_CACHE, PAGES_CACHE, IMAGE_CACHE]
const CACHE_PREFIX = 'jaliz-'

// 8s timeout allows slow mobile/cellular networks without premature 503 errors
const NETWORK_TIMEOUT_MS = 8000
const MAX_IMAGE_ENTRIES = 60

// Only static app-shell assets and offline fallback.
// Dynamic pages like '/' are excluded to prevent caching stale unauthenticated landing page.
const PRECACHE_URLS = [
  '/offline.html',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  '/logo-vertical.jpg',
  '/logo-horizontal.jpg',
  '/logo-icon.jpg',
  '/logo-icon-dark.jpg',
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

  // Dynamic user paths and Next.js RSC requests must never serve stale unauthenticated responses
  if (isDynamicUserPath(url.pathname) || isRscRequest(request, url)) {
    if (request.mode === 'navigate') {
      event.respondWith(networkFirstPage(request, PAGES_CACHE, NETWORK_TIMEOUT_MS))
      return
    }
    // Client-side RSC fetches and data requests go directly to network
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request, PAGES_CACHE, NETWORK_TIMEOUT_MS))
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
    url.pathname === '/logo-vertical.jpg' ||
    url.pathname === '/logo-horizontal.jpg' ||
    url.pathname === '/logo-icon.jpg' ||
    url.pathname === '/logo-icon-dark.jpg' ||
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

function isDynamicUserPath(pathname) {
  if (
    pathname === '/' ||
    pathname === '/schedule' ||
    pathname.startsWith('/marketplace/chats') ||
    pathname.startsWith('/shop') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/plants/new') ||
    pathname.startsWith('/plants/diagnose')
  ) {
    return true
  }
  return false
}

function isRscRequest(request, url) {
  if (url.searchParams.has('_rsc')) return true
  try {
    if (request.headers && (request.headers.get('RSC') === '1' || request.headers.get('rsc') === '1')) {
      return true
    }
  } catch {}
  return false
}

async function networkFirstPage(request, cacheName, timeoutMs) {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    const response = await fetch(request, { signal: controller.signal })
    clearTimeout(timer)

    if (response && response.status === 200) {
      const url = new URL(request.url)
      // Never cache dynamic user pages (prevents serving stale landing page to authenticated users)
      if (!isDynamicUserPath(url.pathname)) {
        const cache = await caches.open(cacheName)
        await cache.put(request, response.clone())
      }
    }
    return response
  } catch {
    const url = new URL(request.url)
    if (!isDynamicUserPath(url.pathname)) {
      const cache = await caches.open(cacheName)
      const cached = await cache.match(request)
      if (cached) return cached
    }

    const shell = await caches.open(SHELL_CACHE)
    const offlinePage = await shell.match('/offline.html')
    if (offlinePage) return offlinePage

    return new Response('Offline', { status: 503, statusText: 'Offline' })
  }
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
  const url = new URL(request.url)
  const isDynamic = isDynamicUserPath(url.pathname) || isRscRequest(request, url)

  try {
    const response = await Promise.race([
      fetch(request).then(async (res) => {
        if (res && res.status === 200 && !isDynamic) {
          const cache = await caches.open(cacheName)
          await cache.put(request, res.clone())
        }
        return res
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), timeoutMs),
      ),
    ])
    return response
  } catch {
    if (!isDynamic) {
      const cache = await caches.open(cacheName)
      const cached = await cache.match(request)
      if (cached) return cached
    }
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
  let title = 'جالیز 💧'
  let body = 'یادآور آبیاری گیاهان شما'
  let targetUrl = '/schedule'

  if (event.data) {
    try {
      const payload = event.data.json()
      if (payload.title) title = payload.title
      if (payload.body) body = payload.body
      if (payload.url) targetUrl = payload.url
    } catch {
      body = event.data.text()
    }
  }

  const options = {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: { url: targetUrl },
    tag: 'jaliz-watering-reminder',
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = (event.notification.data && event.notification.data.url) || '/schedule'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl)
          }
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    }),
  )
})
