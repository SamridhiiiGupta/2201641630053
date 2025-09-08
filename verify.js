const http = require('http');

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? Buffer.from(JSON.stringify(body)) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path,
        method,
        headers: payload
          ? { 'Content-Type': 'application/json', 'Content-Length': payload.length }
          : {},
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          resolve({ status: res.statusCode, headers: res.headers, text });
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

(async () => {
  const create = await request('POST', '/shorturls', {
    url: 'https://example.com',
    validity: 1,
  });
  console.log('CREATE', create.status, create.text);
  const { shortLink } = JSON.parse(create.text);
  const code = shortLink.split('/').pop();

  const head = await request('GET', `/${code}`);
  console.log('REDIRECT STATUS', head.status, 'location:', head.headers.location);

  const stats = await request('GET', `/shorturls/${code}/stats`);
  console.log('STATS', stats.status, stats.text);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});


