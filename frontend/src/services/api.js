const BASE = import.meta.env.VITE_API_BASE_URL || '';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}/api/${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function getOdds() {
  return request('getOdds');
}

export function getAlerts(limit = 20) {
  return request(`getAlerts?limit=${limit}`);
}

export function getMarkets() {
  return request('getMarkets');
}

export function connectService(service, userId, redirectUri) {
  return request('connectService', {
    method: 'POST',
    body: JSON.stringify({ service, userId, redirectUri }),
  });
}
