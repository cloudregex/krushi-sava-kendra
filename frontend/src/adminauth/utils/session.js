const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  return window.atob(padded);
};

export const parseToken = (token) => {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    return JSON.parse(decodeBase64Url(payload));
  } catch {
    return null;
  }
};

export const getTokenExpiryTime = (token) => {
  const payload = parseToken(token);
  return payload?.exp ? payload.exp * 1000 : null;
};

export const clearAuthStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const notifySessionLogout = (reason = 'expired') => {
  window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason } }));
};

export const isTokenExpired = (token) => {
  const expiryTime = getTokenExpiryTime(token);
  if (!expiryTime) return true;
  return Date.now() >= expiryTime;
};

export const getStoredSession = () => {
  const token = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');

  if (!token || !savedUser) {
    clearAuthStorage();
    return null;
  }

  if (isTokenExpired(token)) {
    clearAuthStorage();
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch {
    clearAuthStorage();
    return null;
  }
};
