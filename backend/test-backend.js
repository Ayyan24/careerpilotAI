const http = require('http');

const getRoot = () => {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: 'localhost', port: 3000, path: '/', method: 'GET' }, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: body.slice(0, 200) }));
    });
    req.on('error', reject);
    req.end();
  });
};

const postChat = () => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ message: 'Hello' });
    const req = http.request(
      { hostname: 'localhost', port: 3000, path: '/chat', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body }));
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

(async () => {
  try {
    const root = await getRoot();
    console.log('GET_STATUS:' + root.status);
    console.log('GET_BODY:' + root.body.replace(/\n/g, ' '));
    const chat = await postChat();
    console.log('CHAT_STATUS:' + chat.status);
    console.log('CHAT_BODY:' + chat.body);
  } catch (error) {
    console.error('TEST_ERROR', error.message);
    process.exit(1);
  }
})();
