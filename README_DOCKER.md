# Docker Quick Start for BuildTrack AI

This file explains how to build and run the full stack using Docker Compose.

Prerequisites
- Docker Engine and Docker Compose installed locally.

Build and run

```bash
docker compose build
docker compose up -d
```

Notes
- The `server` uses a local SQLite database file `server/dev.db` mounted as a volume for convenience.
- The AI service mounts `ai-service/model` so trained model files are preserved.
- If you want Postgres/Redis instead, update `server/prisma/schema.prisma` and `docker-compose.yml` accordingly.
