(() => {
  const countVisit = () => {
    if (sessionStorage.getItem('recetelab_visit_counted')) return;
    const visitorKey = 'recetelab_visitor_id';
    let visitorId = localStorage.getItem(visitorKey);
    if (!visitorId) {
      visitorId = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(visitorKey, visitorId);
    }
    fetch('/api/visit', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({visitorId}),
      keepalive: true
    }).then(response => {
      if (response.ok) sessionStorage.setItem('recetelab_visit_counted', '1');
    }).catch(() => {});
  };
  if ('requestIdleCallback' in window) requestIdleCallback(countVisit, {timeout: 2500});
  else setTimeout(countVisit, 1200);
})();
