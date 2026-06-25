// تصحيح مشكلة WebSocket HTTPS
if (typeof window !== 'undefined') {
  const OriginalWebSocket = window.WebSocket;
  window.WebSocket = function(url, protocols) {
    if (url.startsWith('ws:') && window.location.protocol === 'https:') {
      url = url.replace('ws:', 'wss:');
    }
    return new OriginalWebSocket(url, protocols);
  };
  window.WebSocket.prototype = OriginalWebSocket.prototype;
}
