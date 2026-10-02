// Streams downloads straight to the browser's download manager (works for multi-GB files)
const pending = new Map();
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("message", e => { const d = e.data; if (d && d.dl) pending.set(d.id, d); });
self.addEventListener("fetch", e => {
  const m = new URL(e.request.url).pathname.match(/\/__dl\/([^/]+)\/(.+)$/);
  if (!m) return;
  const d = pending.get(m[1]);
  if (!d) return;
  pending.delete(m[1]);
  const name = decodeURIComponent(m[2]);
  const h = new Headers({
    "Content-Type": "application/octet-stream",
    "Content-Disposition": "attachment; filename*=UTF-8''" + encodeURIComponent(name),
    "Cache-Control": "no-store"
  });
  if (d.size) h.set("Content-Length", String(d.size));
  e.respondWith(new Response(d.stream, { headers: h }));
});
