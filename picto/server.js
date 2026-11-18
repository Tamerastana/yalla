// Picto — a small photo-sharing app (Instagram-style) with an admin database viewer.
// Zero dependencies: uses Node's built-in http, crypto and sqlite modules (Node 22.13+).
// Run:  node server.js   then open http://localhost:3000

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = Number(process.env.PORT) || 3000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const DB_FILE = path.join(__dirname, 'picto.db');
const SESSION_DAYS = 7;
const MAX_BODY = 6 * 1024 * 1024; // 6 MB (images are sent as base64)

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ---------------------------------------------------------------- database
const db = new DatabaseSync(DB_FILE);
db.exec(`
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
    full_name     TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
    bio           TEXT NOT NULL DEFAULT '',
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS posts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_path TEXT NOT NULL,
    caption    TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS likes (
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, post_id)
  );
  CREATE TABLE IF NOT EXISTS comments (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    text       TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS follows (
    follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (follower_id, followee_id)
  );
  CREATE TABLE IF NOT EXISTS login_attempts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    username   TEXT NOT NULL,
    success    INTEGER NOT NULL,
    ip         TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// ---------------------------------------------------------------- passwords
// scrypt with a random salt; stored as "scrypt$<salt>$<hash>". Plain passwords are never stored.
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}
function verifyPassword(password, stored) {
  const [, salt, hash] = stored.split('$');
  const candidate = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(candidate, Buffer.from(hash, 'hex'));
}

// Seed the admin account on first run.
if (!db.prepare('SELECT 1 FROM users WHERE username = ?').get(ADMIN_USERNAME)) {
  db.prepare(
    `INSERT INTO users (username, full_name, email, password_hash, role) VALUES (?, ?, ?, ?, 'admin')`
  ).run(ADMIN_USERNAME, 'Administrator', `${ADMIN_USERNAME}@picto.local`, hashPassword(ADMIN_PASSWORD));
  console.log(`Created admin account -> username: ${ADMIN_USERNAME}  password: ${ADMIN_PASSWORD}`);
}

// ---------------------------------------------------------------- helpers
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon',
};

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function send(res, status, body, headers = {}) {
  const isJson = typeof body !== 'string' && !Buffer.isBuffer(body);
  res.writeHead(status, {
    'Content-Type': isJson ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  });
  res.end(isJson ? JSON.stringify(body) : body);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(new HttpError(413, 'Request too large (max ~4 MB image)')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch { reject(new HttpError(400, 'Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function parseCookies(req) {
  const out = {};
  for (const part of (req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > -1) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function currentUser(req) {
  const token = parseCookies(req).picto_session;
  if (!token) return null;
  return db.prepare(`
    SELECT u.id, u.username, u.full_name, u.email, u.role, u.bio
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token = ? AND s.expires_at > datetime('now')`).get(token) || null;
}

function requireUser(req) {
  const user = currentUser(req);
  if (!user) throw new HttpError(401, 'Please log in');
  return user;
}
function requireAdmin(req) {
  const user = requireUser(req);
  if (user.role !== 'admin') throw new HttpError(403, 'Admins only');
  return user;
}

function createSession(res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare(`INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, datetime('now', ?))`)
    .run(token, userId, `+${SESSION_DAYS} days`);
  res.setHeader('Set-Cookie',
    `picto_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_DAYS * 86400}`);
}

function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '';
}

function str(v, field, { min = 0, max = 500 } = {}) {
  const s = typeof v === 'string' ? v.trim() : '';
  if (s.length < min) throw new HttpError(400, min === 1 ? `${field} is required` : `${field} must be at least ${min} characters`);
  if (s.length > max) throw new HttpError(400, `${field} must be at most ${max} characters`);
  return s;
}

function saveImage(dataUrl) {
  const m = /^data:image\/(png|jpe?g|gif|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || '');
  if (!m) throw new HttpError(400, 'Please choose a PNG, JPG, GIF or WEBP image');
  const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
  const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), Buffer.from(m[2], 'base64'));
  return `/uploads/${name}`;
}

function serveFile(res, baseDir, relPath) {
  const filePath = path.normalize(path.join(baseDir, relPath));
  if (!filePath.startsWith(baseDir + path.sep)) return send(res, 404, 'Not found');
  fs.readFile(filePath, (err, data) => {
    if (err) return send(res, 404, 'Not found');
    send(res, 200, data, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
  });
}

function redirect(res, to) { res.writeHead(302, { Location: to }); res.end(); }

// Posts with author, like count, whether current user liked, and comments.
function loadPosts(viewerId, whereSql = '', params = []) {
  const posts = db.prepare(`
    SELECT p.id, p.image_path, p.caption, p.created_at, p.user_id,
           u.username, u.full_name,
           (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
           EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) AS liked
    FROM posts p JOIN users u ON u.id = p.user_id
    ${whereSql}
    ORDER BY p.created_at DESC, p.id DESC LIMIT 100`).all(viewerId, ...params);
  const commentStmt = db.prepare(`
    SELECT c.id, c.text, c.created_at, u.username
    FROM comments c JOIN users u ON u.id = c.user_id
    WHERE c.post_id = ? ORDER BY c.id`);
  return posts.map((p) => ({ ...p, liked: !!p.liked, comments: commentStmt.all(p.id) }));
}

// Tables the admin "database" page may browse, with the columns to show.
const ADMIN_TABLES = {
  users: 'id, username, full_name, email, role, bio, substr(password_hash, 1, 24) || \'…\' AS password_hash, created_at',
  posts: 'id, user_id, image_path, caption, created_at',
  comments: 'id, user_id, post_id, text, created_at',
  likes: 'user_id, post_id, created_at',
  follows: 'follower_id, followee_id, created_at',
  sessions: 'substr(token, 1, 12) || \'…\' AS token, user_id, created_at, expires_at',
  login_attempts: 'id, username, success, ip, created_at',
};

// ---------------------------------------------------------------- API routes
const routes = [];
const route = (method, pattern, handler) => {
  const keys = [];
  const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
  routes.push({ method, re, keys, handler });
};

route('POST', '/api/register', async (req, res) => {
  const b = await readJson(req);
  const username = str(b.username, 'Username', { min: 3, max: 30 });
  if (!/^[a-zA-Z0-9._]+$/.test(username)) throw new HttpError(400, 'Username may only contain letters, numbers, dots and underscores');
  const fullName = str(b.fullName, 'Full name', { min: 1, max: 60 });
  const email = str(b.email, 'Email', { min: 1, max: 120 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Please enter a valid email');
  const password = typeof b.password === 'string' ? b.password : '';
  if (password.length < 6) throw new HttpError(400, 'Password must be at least 6 characters');
  if (db.prepare('SELECT 1 FROM users WHERE username = ?').get(username)) throw new HttpError(409, 'That username is taken');
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) throw new HttpError(409, 'An account with that email already exists');
  const { lastInsertRowid } = db.prepare(
    'INSERT INTO users (username, full_name, email, password_hash) VALUES (?, ?, ?, ?)'
  ).run(username, fullName, email, hashPassword(password));
  createSession(res, Number(lastInsertRowid));
  send(res, 201, { ok: true });
});

route('POST', '/api/login', async (req, res) => {
  const b = await readJson(req);
  const login = str(b.username, 'Username or email', { min: 1, max: 120 });
  const password = typeof b.password === 'string' ? b.password : '';
  const ip = clientIp(req);

  // Simple brute-force protection: 5 failed attempts per username in 15 minutes.
  const recentFails = db.prepare(`
    SELECT COUNT(*) AS n FROM login_attempts
    WHERE username = ? COLLATE NOCASE AND success = 0 AND created_at > datetime('now', '-15 minutes')`).get(login).n;
  if (recentFails >= 5) throw new HttpError(429, 'Too many failed attempts. Try again in 15 minutes.');

  const user = db.prepare('SELECT id, password_hash, role FROM users WHERE username = ? OR email = ?').get(login, login);
  const ok = !!user && verifyPassword(password, user.password_hash);
  db.prepare('INSERT INTO login_attempts (username, success, ip) VALUES (?, ?, ?)').run(login, ok ? 1 : 0, ip);
  if (!ok) throw new HttpError(401, 'Sorry, your username or password was incorrect.');

  createSession(res, user.id);
  send(res, 200, { ok: true, role: user.role });
});

route('POST', '/api/logout', async (req, res) => {
  const token = parseCookies(req).picto_session;
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  res.setHeader('Set-Cookie', 'picto_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
  send(res, 200, { ok: true });
});

route('GET', '/api/me', async (req, res) => {
  send(res, 200, { user: currentUser(req) });
});

route('GET', '/api/posts', async (req, res) => {
  const me = requireUser(req);
  send(res, 200, { posts: loadPosts(me.id) });
});

route('POST', '/api/posts', async (req, res) => {
  const me = requireUser(req);
  const b = await readJson(req);
  const caption = str(b.caption, 'Caption', { max: 2200 });
  const imagePath = saveImage(b.image);
  db.prepare('INSERT INTO posts (user_id, image_path, caption) VALUES (?, ?, ?)').run(me.id, imagePath, caption);
  send(res, 201, { ok: true });
});

route('DELETE', '/api/posts/:id', async (req, res, { id }) => {
  const me = requireUser(req);
  const post = db.prepare('SELECT user_id, image_path FROM posts WHERE id = ?').get(id);
  if (!post) throw new HttpError(404, 'Post not found');
  if (post.user_id !== me.id && me.role !== 'admin') throw new HttpError(403, 'Not your post');
  db.prepare('DELETE FROM posts WHERE id = ?').run(id);
  fs.rm(path.join(__dirname, post.image_path), () => {});
  send(res, 200, { ok: true });
});

route('POST', '/api/posts/:id/like', async (req, res, { id }) => {
  const me = requireUser(req);
  if (!db.prepare('SELECT 1 FROM posts WHERE id = ?').get(id)) throw new HttpError(404, 'Post not found');
  const removed = db.prepare('DELETE FROM likes WHERE user_id = ? AND post_id = ?').run(me.id, id).changes;
  if (!removed) db.prepare('INSERT INTO likes (user_id, post_id) VALUES (?, ?)').run(me.id, id);
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM likes WHERE post_id = ?').get(id);
  send(res, 200, { liked: !removed, like_count: n });
});

route('POST', '/api/posts/:id/comments', async (req, res, { id }) => {
  const me = requireUser(req);
  const b = await readJson(req);
  const text = str(b.text, 'Comment', { min: 1, max: 500 });
  if (!db.prepare('SELECT 1 FROM posts WHERE id = ?').get(id)) throw new HttpError(404, 'Post not found');
  db.prepare('INSERT INTO comments (user_id, post_id, text) VALUES (?, ?, ?)').run(me.id, id, text);
  send(res, 201, { ok: true });
});

route('GET', '/api/users/:username', async (req, res, { username }) => {
  const me = requireUser(req);
  const user = db.prepare('SELECT id, username, full_name, bio, created_at FROM users WHERE username = ?').get(username);
  if (!user) throw new HttpError(404, 'User not found');
  const count = (sql) => db.prepare(sql).get(user.id).n;
  send(res, 200, {
    user,
    is_me: user.id === me.id,
    following: !!db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ?').get(me.id, user.id),
    followers: count('SELECT COUNT(*) AS n FROM follows WHERE followee_id = ?'),
    following_count: count('SELECT COUNT(*) AS n FROM follows WHERE follower_id = ?'),
    posts: loadPosts(me.id, 'WHERE p.user_id = ?', [user.id]),
  });
});

route('POST', '/api/users/:username/follow', async (req, res, { username }) => {
  const me = requireUser(req);
  const user = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (!user) throw new HttpError(404, 'User not found');
  if (user.id === me.id) throw new HttpError(400, "You can't follow yourself");
  const removed = db.prepare('DELETE FROM follows WHERE follower_id = ? AND followee_id = ?').run(me.id, user.id).changes;
  if (!removed) db.prepare('INSERT INTO follows (follower_id, followee_id) VALUES (?, ?)').run(me.id, user.id);
  send(res, 200, { following: !removed });
});

route('PATCH', '/api/me', async (req, res) => {
  const me = requireUser(req);
  const b = await readJson(req);
  const fullName = str(b.fullName ?? me.full_name, 'Full name', { min: 1, max: 60 });
  const bio = str(b.bio ?? me.bio, 'Bio', { max: 150 });
  db.prepare('UPDATE users SET full_name = ?, bio = ? WHERE id = ?').run(fullName, bio, me.id);
  send(res, 200, { ok: true });
});

// ---- admin
route('GET', '/api/admin/stats', async (req, res) => {
  requireAdmin(req);
  const n = (t) => db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n;
  send(res, 200, {
    users: n('users'), posts: n('posts'), comments: n('comments'), likes: n('likes'),
    logins_today: db.prepare(`SELECT COUNT(*) AS n FROM login_attempts WHERE success = 1 AND created_at > datetime('now','-1 day')`).get().n,
    failed_today: db.prepare(`SELECT COUNT(*) AS n FROM login_attempts WHERE success = 0 AND created_at > datetime('now','-1 day')`).get().n,
  });
});

route('GET', '/api/admin/tables', async (req, res) => {
  requireAdmin(req);
  send(res, 200, { tables: Object.keys(ADMIN_TABLES) });
});

route('GET', '/api/admin/tables/:name', async (req, res, { name }) => {
  requireAdmin(req);
  const cols = ADMIN_TABLES[name];
  if (!cols) throw new HttpError(404, 'Unknown table');
  const order = name === 'likes' || name === 'follows' || name === 'sessions' ? 'created_at' : 'id';
  const rows = db.prepare(`SELECT ${cols} FROM ${name} ORDER BY ${order} DESC LIMIT 500`).all();
  const columns = db.prepare(`SELECT ${cols} FROM ${name} LIMIT 0`).columns().map((c) => c.name);
  send(res, 200, { table: name, columns, rows });
});

route('PATCH', '/api/admin/users/:id', async (req, res, { id }) => {
  const admin = requireAdmin(req);
  const b = await readJson(req);
  if (!['user', 'admin'].includes(b.role)) throw new HttpError(400, 'Role must be user or admin');
  if (Number(id) === admin.id) throw new HttpError(400, "You can't change your own role");
  const { changes } = db.prepare('UPDATE users SET role = ? WHERE id = ?').run(b.role, id);
  if (!changes) throw new HttpError(404, 'User not found');
  send(res, 200, { ok: true });
});

route('DELETE', '/api/admin/users/:id', async (req, res, { id }) => {
  const admin = requireAdmin(req);
  if (Number(id) === admin.id) throw new HttpError(400, "You can't delete yourself");
  const images = db.prepare('SELECT image_path FROM posts WHERE user_id = ?').all(id);
  const { changes } = db.prepare('DELETE FROM users WHERE id = ?').run(id);
  if (!changes) throw new HttpError(404, 'User not found');
  for (const { image_path } of images) fs.rm(path.join(__dirname, image_path), () => {});
  send(res, 200, { ok: true });
});

route('DELETE', '/api/admin/comments/:id', async (req, res, { id }) => {
  requireAdmin(req);
  db.prepare('DELETE FROM comments WHERE id = ?').run(id);
  send(res, 200, { ok: true });
});

// ---------------------------------------------------------------- server
const PAGES = { '/login': 'login.html', '/feed': 'feed.html', '/admin': 'admin.html' };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);
  try {
    if (pathname.startsWith('/api/')) {
      for (const r of routes) {
        const m = r.method === req.method && r.re.exec(pathname);
        if (m) {
          const params = Object.fromEntries(r.keys.map((k, i) => [k, m[i + 1]]));
          return await r.handler(req, res, params);
        }
      }
      throw new HttpError(404, 'Not found');
    }

    if (pathname === '/') return redirect(res, currentUser(req) ? '/feed' : '/login');
    if (pathname === '/login' && currentUser(req)) return redirect(res, '/feed');
    if ((pathname === '/feed' || pathname.startsWith('/u/')) && !currentUser(req)) return redirect(res, '/login');
    if (pathname === '/admin') {
      const u = currentUser(req);
      if (!u) return redirect(res, '/login');
      if (u.role !== 'admin') return redirect(res, '/feed');
    }
    if (PAGES[pathname]) return serveFile(res, PUBLIC_DIR, PAGES[pathname]);
    if (pathname.startsWith('/u/')) return serveFile(res, PUBLIC_DIR, 'feed.html'); // profile view
    if (pathname.startsWith('/uploads/')) return serveFile(res, UPLOAD_DIR, pathname.slice('/uploads/'.length));
    return serveFile(res, PUBLIC_DIR, pathname.slice(1));
  } catch (err) {
    if (err instanceof HttpError) return send(res, err.status, { error: err.message });
    console.error(err);
    send(res, 500, { error: 'Something went wrong' });
  }
});

server.listen(PORT, () => console.log(`Picto running at http://localhost:${PORT}`));
