// Service worker «Моей заколки» (ТЗ 2.1): всё приложение — в кэше при установке, дальше работает
// без сети. Новая версия ставится в фоне и ждёт: включается, когда приложение закрыто и открыто
// снова. Страницу среза /spike/ не обслуживает и не кэширует. Список файлов и версию подставляет
// сборка (vite.config.ts).
const VERSION = '2efd1c8f2aab';
const FILES = ["/","/assets/DeviceScreen-CyJ5ZAXH.js","/assets/LibraryScreen-CWfcTG2Y.js","/assets/index-CIk1LyIn.js","/assets/index-eRNLm7pz.css","/assets/mulish-cyrillic-300-italic-BC_BQ2Pe.woff2","/assets/mulish-cyrillic-400-normal-NYULt11J.woff2","/assets/mulish-cyrillic-600-normal-CKFF8GaG.woff2","/assets/mulish-cyrillic-700-normal-Cdb6nxyj.woff2","/assets/mulish-cyrillic-800-normal-C_e00Lsl.woff2","/assets/mulish-cyrillic-900-normal-B3BzS37a.woff2","/assets/mulish-latin-300-italic-mDVFBTiI.woff2","/assets/mulish-latin-400-normal-C9Snyl1s.woff2","/assets/mulish-latin-600-normal-BSghSUeJ.woff2","/assets/mulish-latin-700-normal-DP36JSCV.woff2","/assets/mulish-latin-800-normal-B_RVkmOV.woff2","/assets/mulish-latin-900-normal-3VD4o35o.woff2","/assets/press-start-2p-cyrillic-400-normal-DBn7fddJ.woff2","/assets/press-start-2p-latin-400-normal-_wFEWmAB.woff2","/assets/tiny5-cyrillic-400-normal-CzHgMhVb.woff2","/assets/tiny5-latin-400-normal-BsIaeAHC.woff2","/assets/unbounded-cyrillic-800-normal--HlTIRd4.woff2","/assets/unbounded-latin-800-normal-CN2Hxyoo.woff2","/assets/worker-BccleofB.js","/icons/icon-192.png","/icons/icon-512.png","/icons/icon-any.svg","/icons/icon-maskable-192.png","/icons/icon-maskable-512.png","/icons/icon-maskable.svg","/icons/icon-monochrome-512.png","/icons/icon-monochrome.svg","/manifest.webmanifest"];
const CACHE = `zk-${VERSION}`;

self.addEventListener('install', (e) => {
  // cache: 'reload' — мимо HTTP-кэша: Pages отдаёт max-age=600, и старый index.html ссылался бы
  // на хэшированные файлы прошлой выкладки, которых уже нет
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((u) => new Request(u, { cache: 'reload' })))));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('zk-') && k !== CACHE).map((k) => caches.delete(k)))));
});

self.addEventListener('message', (e) => {
  if (e.data === 'version') e.source?.postMessage({ version: VERSION });
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || url.pathname === '/spike' || url.pathname.startsWith('/spike/')) return;
  // Переходы по адресам приложения — всегда его страница
  const key = req.mode === 'navigate' ? '/' : url.pathname;
  e.respondWith(caches.open(CACHE).then((c) => c.match(key).then((hit) => hit ?? fetch(req))));
});
