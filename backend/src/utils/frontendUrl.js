/**
 * Dynamically resolves the frontend base URL.
 *
 * Priority:
 *  1. FRONTEND_URL env var (if explicitly set and not the placeholder "auto")
 *  2. Auto-detected LAN IP with HTTPS on port 5173
 *  3. Fallback: https://localhost:5173
 */
const os = require('os');

let _cachedUrl = null;

function getLocalIPv4() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip loopback and non-IPv4
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

function getFrontendUrl() {
  if (_cachedUrl) return _cachedUrl;

  const envUrl = process.env.FRONTEND_URL;

  // If explicitly set to a real URL (not "auto"), use it
  if (envUrl && envUrl !== 'auto' && envUrl.startsWith('http')) {
    _cachedUrl = envUrl.replace(/\/+$/, ''); // strip trailing slash
    return _cachedUrl;
  }

  // Auto-detect
  const ip = getLocalIPv4();
  const port = process.env.FRONTEND_PORT || '5173';
  const protocol = process.env.FRONTEND_PROTOCOL || 'https';
  _cachedUrl = `${protocol}://${ip}:${port}`;
  console.log(`🌐 Auto-detected FRONTEND_URL: ${_cachedUrl}`);
  return _cachedUrl;
}

// Allow cache reset (useful if network changes during long-running process)
function resetCache() {
  _cachedUrl = null;
}

module.exports = { getFrontendUrl, getLocalIPv4, resetCache };
