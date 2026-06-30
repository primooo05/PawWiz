export const API_BASE =
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
  window.location.port !== '3001' &&
  window.location.port !== ''
    ? 'http://localhost:3001'
    : '';
