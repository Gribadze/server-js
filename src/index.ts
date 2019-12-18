import * as http from 'http';
import * as url from 'url';

const server = http.createServer();

server.on('request', (req, res) => {
  const {
    query: { clientId, clientSecret },
  } = url.parse(req.url, true);
  const script = `
window.clientId = ${clientId};
window.clientSecret = ${clientSecret};
`;
  res.writeHead(200, { 'Content-type': 'text/javascript' });
  res.end(script, 'utf-8');
});

server.listen(3000);
