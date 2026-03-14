# Deployment Guide - BirdSky

## Environment Variables

Set these in your deployment platform (Render, Heroku, Railway, etc.):

| Variable    | Required | Description                    |
|-------------|----------|--------------------------------|
| `DB_HOST`   | Yes      | MySQL host (e.g. Aiven Cloud) |
| `DB_PORT`   | Yes      | MySQL port (often 3306 or 14794) |
| `DB_USER`   | Yes      | Database username              |
| `DB_PASSWORD` | Yes    | Database password              |
| `DB_NAME`   | Yes      | Database name (e.g. defaultdb) |
| `JWT_SECRET`| Yes      | Secret for auth (min 32 chars) |
| `CLOUDINARY_URL` | No  | For persistent images (see below) |
| `PORT`      | No       | Server port (set by platform)  |

## Database Setup

1. Run all SQL scripts in the `db/` folder on your production database:
   - Create `users`, `profiles`, `posts`, `likes`, `comments`, `followers`, `notifications` tables
2. Ensure the database name in `DB_NAME` matches where you created the tables.

## Image Storage (Important for Deploy)

**Local disk storage is ephemeral** on most platforms. Uploaded images are **lost on every restart/deploy**.

### Use Cloudinary (recommended – already integrated)

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier).
2. Copy your **Environment URL** from the dashboard (format: `cloudinary://api_key:api_secret@cloud_name`).
3. Set env var: `CLOUDINARY_URL=cloudinary://...`
4. Deploy. Images will be stored in Cloudinary and persist across restarts.

## Platform-Specific Notes

### Render
- Add env vars in Dashboard → Environment
- Use a PostgreSQL or MySQL add-on, or connect to external DB (Aiven)
- Build: `npm install`
- Start: `npm start`

### Heroku
- `heroku config:set DB_HOST=...` (etc.)
- The Procfile is already set for `web: node app.js`

### Railway
- Add env vars in project settings
- Connect to Aiven or Railway MySQL

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "User registration failed" | Check env vars are set. Check DB tables exist. View platform logs for `Registration DB error`. |
| "Database connection failed" | Verify DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME. Whitelist deploy platform IP if your DB requires it. |
| Posts not saving | Same as above. Ensure `posts` table exists. |
| Images not loading | Uploads are ephemeral - use cloud storage (Cloudinary/S3). Or verify `public/uploads` path. |
| 404 on /uploads/* | Ensure `public/uploads` exists. The app creates it at startup. |
