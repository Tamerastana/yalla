# Picto: Instagram-style photo sharing app

A small, working photo-sharing site with a login/sign-up page, a feed, profiles and an
admin page that shows the database. It has no dependencies: it only uses Node's built-in
`http`, `crypto` and `node:sqlite` modules.

## Run it

Requires **Node.js 22.13 or newer**.

```bash
cd picto
npm start
```

Open http://localhost:3000.

- **Admin login:** `admin` / `admin123`. Change it with `ADMIN_USERNAME=... ADMIN_PASSWORD=... npm start` on the first run.
- Create normal users with **Sign up** on the login page.

## Pages

| URL           | What it is                                                                 |
|---------------|-----------------------------------------------------------------------------|
| `/login`      | Log in / sign up (toggle), show/hide password, validation, error messages  |
| `/feed`       | Upload photos with captions, like, comment, delete your own posts          |
| `/u/:name`    | Profile: post grid, followers/following, follow button, edit bio           |
| `/admin`      | Admin only: stats, browse every database table, filter, delete, change roles |

## Architecture

```
Browser (HTML/CSS/vanilla JS)
   │  fetch() JSON  +  HttpOnly session cookie
   ▼
server.js (Node http server)
   ├── static files  (public/, uploads/)
   ├── REST API      (/api/...)
   ├── auth          (scrypt password hashing, session tokens, login rate limiting)
   └── SQLite DB     (picto.db)
```

### Database tables

- `users`: id, username, full_name, email, password_hash, role (`user`/`admin`), bio, created_at
- `sessions`: token, user_id, created_at, expires_at
- `posts`: id, user_id, image_path, caption, created_at
- `likes`: (user_id, post_id), created_at
- `comments`: id, user_id, post_id, text, created_at
- `follows`: (follower_id, followee_id), created_at
- `login_attempts`: id, username, success, ip, created_at (audit log for the login page)

### Login security

- Passwords are hashed with **scrypt plus a random salt**. Plain-text passwords are never stored
  or shown, not even on the admin page.
- Sessions use a random 256-bit token in an `HttpOnly; SameSite=Lax` cookie and expire after 7 days.
- After 5 failed logins for the same username within 15 minutes, further attempts are blocked.
- Every login attempt is recorded in `login_attempts`, which the admin page shows.

### API

| Method | Path                              | Auth  |
|--------|-----------------------------------|-------|
| POST   | `/api/register`                   | none  |
| POST   | `/api/login`                      | none  |
| POST   | `/api/logout`                     | user  |
| GET    | `/api/me`                         | none  |
| PATCH  | `/api/me`                         | user  |
| GET    | `/api/posts`                      | user  |
| POST   | `/api/posts`                      | user  |
| DELETE | `/api/posts/:id`                  | owner or admin |
| POST   | `/api/posts/:id/like`             | user  |
| POST   | `/api/posts/:id/comments`         | user  |
| GET    | `/api/users/:username`            | user  |
| POST   | `/api/users/:username/follow`     | user  |
| GET    | `/api/admin/stats`                | admin |
| GET    | `/api/admin/tables`               | admin |
| GET    | `/api/admin/tables/:name`         | admin |
| PATCH  | `/api/admin/users/:id`            | admin |
| DELETE | `/api/admin/users/:id`            | admin |
| DELETE | `/api/admin/comments/:id`         | admin |
