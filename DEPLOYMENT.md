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
   - **create-followers-table.sql** – required for follow/unfollow (if you see "0 Followers" or follow button fails, run this)
   - **create-notifications-table.sql**
   - Ensure `users`, `profiles`, `posts`, `likes`, `comments` tables exist (from your initial setup)
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
| "0 Followers / 0 Following" always | Run `db/create-followers-table.sql` on your database. |
| "User registration failed" | Check env vars. Ensure `users` and `profiles` tables exist. Check logs for `Registration DB error`. |
| Follow button does nothing / "Database setup incomplete" | Run `db/create-followers-table.sql` on your database. |
| "Database connection failed" | Verify DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME. Whitelist deploy platform IP if required. |
| Posts not saving | Ensure `posts` table exists. Check logs. |
| Post images blank / not loading | Set `CLOUDINARY_URL` (Render filesystem is ephemeral – images are lost on restart without Cloudinary). |
| 404 on /images/* | Set `CLOUDINARY_URL` for persistent images on deploy; or images stored in public/images may be lost on restart. |
