# School ERP Platform

Production-oriented School ERP workspace with three apps:

- `mobile`: Expo + React Native app for students and parents
- `backend`: Node.js + Express + TypeScript API
- `test-app`: Next.js admin web app

## Structure

```text
school-mobile-new/
|- backend/         # Express API, business logic, MongoDB integration
|- shared-types/    # Shared TypeScript contracts used across apps
|- src/             # Expo mobile application source
|- test-app/        # Next.js admin web app
```

## Environment

Use the provided examples as the starting point:

- Root mobile app: `.env.example`
- Backend API: `backend/.env.example`
- Admin web: `test-app/.env.example`

## Useful Commands

### Mobile app

```bash
npm install
npm run start
npm run lint
npm run typecheck
```

### Backend

```bash
cd backend
npm install
npm run dev
npm run build
npm run typecheck
```

### Admin web

```bash
cd test-app
npm install
npm run dev
npm run lint
npm run typecheck
```

## Notes

- Mobile and web both read their API URL from environment variables.
- Backend CORS origins are configurable through `CLIENT_URLS`.
- Shared types should be updated whenever the mobile app and admin web need the
  same response contract.
