# BuildTrack AI Architecture Notes

## Services

- Frontend: Next.js client app
- Backend: Express API with JWT, RBAC, Socket.IO
- AI Service: FastAPI inference microservice
- Data: PostgreSQL primary store, Redis for cache/notifications

## Data Flow

1. Engineer updates progress/task status in frontend.
2. Backend validates token and role.
3. Backend persists updates to PostgreSQL.
4. Backend emits Socket.IO event for dashboards.
5. Manager dashboard updates charts in near real-time.
6. Prediction requests are forwarded to AI service.

## Security Controls Included

- Password hashing with bcrypt
- JWT access token auth
- Role-guard middleware
- Helmet and CORS setup
- Request validation with zod
- Basic API rate limiting
