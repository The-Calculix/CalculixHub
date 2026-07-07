# CalculixHub realtime setup

This patch adds real user-data storage, authenticated APIs, realtime dashboard updates, and CI/CD workflows.

## 1. Install packages

```bash
npm install @supabase/supabase-js express cors
npm install -D @types/express @types/cors
```

## 2. Create a Supabase project

Copy the values into `.env` locally and into Vercel/GitHub secrets for deployment.

Required local variables:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Do not put real keys in `.env.example`.

## 3. Apply the database migration

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

The migration does not insert demo data.

## 4. Add the API router

Copy `server/routes/userData.ts`, `server/middleware/requireUser.ts`, and `server/supabaseAdmin.ts` into your backend.
Then mount the router in your existing `server.ts`:

```ts
import { userDataRouter } from './server/routes/userData';
app.use('/api', userDataRouter);
```

Adjust the import path depending on your project structure.

## 5. Track real learning events

Call this only after a real user action, such as finishing a quiz or lesson:

```ts
import { trackLearningEvent } from './lib/trackLearningEvent';

await trackLearningEvent({
  event_type: 'quiz_submitted',
  subject: 'math',
  skill: 'linear-equations',
  lesson_id: 'algebra-01',
  score: 0.92,
  duration_seconds: 480,
  metadata: { source: 'quiz-page' },
});
```

## 6. Render the realtime dashboard

```tsx
import { LiveDashboard } from './components/LiveDashboard';

<LiveDashboard userId={user.id} />
```

## 7. GitHub secrets for workflows

Add these in GitHub repository settings:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_URL`
- `VERCEL_TOKEN`

## Notes

- Realtime data is handled by Supabase Realtime subscriptions, not GitHub Actions.
- GitHub Actions are used for build checks, database migrations, and deployment.
- Empty states are shown when no real user data exists. No fake dashboard numbers are included.
