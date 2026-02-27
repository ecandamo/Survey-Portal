# Meeting Effectiveness Survey (Next.js + Tailwind + Prisma)

## What you get
- Anonymous survey with single-use token links
- Admin dashboard (password protected)
- Tailwind CSS for easy branding later

## Local setup
1) Install deps
   `npm install`

2) Create a Postgres DB
   Use Vercel Postgres, Neon, or Supabase.

3) Create `.env`
   `cp .env.example .env`

4) Set environment variables
   - `DATABASE_URL`
   - `ADMIN_PASSWORD_HASH`
   - `ADMIN_VIEW_KEY`
   - `SEED_TOKENS=20`

5) Generate the admin password hash locally
   `node -e "require('bcryptjs').hash('YourPasswordHere', 10).then(console.log)"`

6) Run the initial migration locally
   `npx prisma migrate dev --name init`

7) Seed tokens
   `npm run seed`

8) Run the app
   `npm run dev`

## Deploy to Vercel
1) Import the project into Vercel.

2) Create and attach a Postgres database.

3) Add the environment variables from `.env.example` in the Vercel project settings.

4) Deploy the app.
   Prisma Client is generated automatically during `npm install` via `postinstall`.

5) Apply migrations against the production database after the first deploy.
   `npx prisma migrate deploy`

6) Seed production tokens once.
   `npm run seed`

## Distributing survey links
After `npm run seed`, the console prints the generated tokens. Survey links look like:

`https://YOURDOMAIN.com/s/TOKENHERE`

Each token can submit once.
