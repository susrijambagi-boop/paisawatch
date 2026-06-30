// PaisaWatch service worker — receives web-push alerts and opens the relevant
// page when a notification is tapped.

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "PaisaWatch", body: event.data ? event.data.text() : "" };
  }
  const title = payload.title || "PaisaWatch";
  const options = {
    body: payload.body || "New public spending recorded.",
    icon: "/icon.png",
    badge: "/icon.png",
    data: { url: payload.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      return self.clients.openWindow(url);
    }),
  );
});
