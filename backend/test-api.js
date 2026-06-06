const http = require('http');

http.get('http://localhost:8001/api/candidates', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('GET /api/candidates:', res.statusCode, data));
});

http.get('http://localhost:8001/api/users', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('GET /api/users:', res.statusCode, data));
});
