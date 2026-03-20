# Papermind (docu-ai-backend + docuai-frontend)

A document management and AI querying system with user authentication, file upload, Kafka pipeline, Redis caching, and OpenAI-style LLM integration.

## 📁 Repository layout

- `docu-ai-backend/` : Papermind backend (Spring Boot, Java 21, Maven)
  - `src/main/java/com/docuai` : application code
  - `src/main/resources/application.yaml` : environment-driven config
  - `Dockerfile` : multi-stage container build
- `docuai-frontend/` : Papermind frontend (React + Vite)
  - `src/` : UI pages and state
  - `vite.config.ts` : dev proxy `/api` → remote backend URL

## 🚀 Features

- REST API with JWT auth (`/api/auth/register`, `/api/auth/login`)
- Full user, document, chat history and admin management
- File upload + text extraction via PDFBox
- Kafka producer/consumer for document ingestion
- Redis caching of prompt/response data
- Groq endpoint integration configured via `groq.api` values
- Spring Security role-based auth
- React SPA with pages for dashboard, documents, history, AI ask, profile, admin

## 🧩 Backend setup

### Requirements
- Java 21
- Maven 3.x
- PostgreSQL
- Redis
- Kafka cluster

### Environment variables
`docu-ai-backend/src/main/resources/application.yaml` uses:
- `DATABASE_URL` (jdbc:postgresql://host:port/db)
- `DB_USERNAME`
- `DB_PASSWORD`
- `REDIS_HOST`
- `REDIS_PORT`
- `KAFKA_BOOTSTRAP_SERVERS`
- `PORT` (default `6000`)
- `JWT_SECRET`
- `GROQ_API_KEY`

### Run locally

```bash
cd docu-ai-backend
mvn clean package
java -jar target/docu-ai-backend-0.0.1-SNAPSHOT.jar
```

### Docker

```bash
cd docu-ai-backend
docker build -t docu-ai-backend .
docker run -e DATABASE_URL=... -e DB_USERNAME=... -e DB_PASSWORD=... -e REDIS_HOST=... -e REDIS_PORT=... \
  -e KAFKA_BOOTSTRAP_SERVERS=... -e JWT_SECRET=... -e GROQ_API_KEY=... -p 6000:6000 docu-ai-backend
```

## 🧩 Frontend setup

### Requirements
- Node.js (>=18 recommended)
- npm or yarn

### Run locally

```bash
cd docuai-frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000` and proxies `/api` calls to the backend URL.

### Build

```bash
npm run build
npm run preview
```

## 🔌 API Endpoints (high-level)

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users`, `GET /api/documents`, etc. (admin routes in `AdminController`)
- file upload via `DocumentController`
- shared public access via `PublicShareController`

## 💡 Notes

- `vite.config.ts` currently proxies `/api` to `https://docu-ai-backend-1.onrender.com` (override for local backend on `http://localhost:6000` by editing this file or setting up your own proxy).
- `application.yaml` has production-safe `ddl-auto: update`; for production use-managed migrations.
- Groq model settings in `application.yaml`: `llama-3.3-70b-versatile` and max tokens 1000.

## 🧪 Tests

to run backend tests:

```bash
cd docu-ai-backend
mvn test
```

frontend has no tests in this repository.

---

Happy hacking! 🎉