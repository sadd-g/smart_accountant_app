// Fix WebSocket HTTPS issue for development
if (typeof global !== 'undefined') {
  const origWebSocket = global.WebSocket;
  if (origWebSocket) {
    global.WebSocket = function(url, protocols) {
      if (typeof url === 'string' && url.startsWith('ws:')) {
        url = url.replace('ws:', 'wss:');
      }
      return new origWebSocket(url, protocols);
    };
    global.WebSocket.prototype = origWebSocket.prototype;
  }
}
