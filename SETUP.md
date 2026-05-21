# Database Setup

## 1. Neon Database

1. გადადი https://neon.tech
2. შექმენი account + project "abituriento"
3. Dashboard-დან დააკოპირე connection string
4. `.env` ფაილი გახსენი და DATABASE_URL შეცვალე:

```
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

## 2. Schema + Seed

```bash
npm run db:push   # schema-ს გამოყენება
npm run db:seed   # 10 uni + 50+ programs + market data
```

## 3. Development

```bash
npm run dev
```

## Vercel Deployment

1. `git push origin main`  
2. Vercel-ში import project
3. Environment Variables-ი დაამატე:
   - `DATABASE_URL` = Neon connection string
   - `CRON_SECRET` = random secret string
   - `NEXT_PUBLIC_APP_URL` = https://your-domain.vercel.app
