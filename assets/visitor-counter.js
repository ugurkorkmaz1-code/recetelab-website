(() => {
  const visitorKey = 'recetelab_visitor_id';
  let visitorId = localStorage.getItem(visitorKey);
  if (!visitorId) {
    visitorId = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(visitorKey, visitorId);
  }

  const payload = extra => ({
    visitorId,
    path: location.pathname,
    referrer: document.referrer || '',
    language: navigator.language || '',
    screen: `${screen.width || 0}x${screen.height || 0}`,
    webdriver: navigator.webdriver === true,
    ...extra
  });

  const send = (extra = {}) => fetch('/api/visit', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload(extra)),
    keepalive: true
  }).catch(() => {});

  const countVisit = () => {
    if (sessionStorage.getItem('recetelab_visit_counted')) return;
    send({event: 'visit'}).then(response => {
      if (response?.ok) sessionStorage.setItem('recetelab_visit_counted', '1');
    });
  };

  let engaged = false;
  const markEngaged = reason => {
    if (engaged || document.visibilityState !== 'visible') return;
    engaged = true;
    send({event: 'engaged', reason});
  };

  let activeSeconds = 0;
  const timer = setInterval(() => {
    if (document.visibilityState === 'visible') activeSeconds++;
    if (activeSeconds >= 10) {
      clearInterval(timer);
      markEngaged('10s-visible');
    }
  }, 1000);

  ['pointerdown','keydown','touchstart','scroll'].forEach(type => {
    addEventListener(type, () => markEngaged(type), {once:true, passive:true});
  });

  if ('requestIdleCallback' in window) requestIdleCallback(countVisit, {timeout: 2500});
  else setTimeout(countVisit, 1200);
})();
