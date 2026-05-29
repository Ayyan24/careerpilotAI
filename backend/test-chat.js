const http = require('http');
const data = JSON.stringify({ message: 'Test career guidance' });
const req = http.request(
  { hostname: 'localhost', port: 3000, path: '/chat', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } },
  (res) => {
    let body = '';
    res.on('data', (chunk) => (body += chunk));
    res.on('end', () => {
      console.log('CHAT_STATUS:' + res.statusCode);
      console.log('CHAT_BODY:' + body);
    });
  }
);
req.on('error', (error) => {
  console.error('CHAT_ERROR:' + error.message);
});
req.write(data);
req.end();
