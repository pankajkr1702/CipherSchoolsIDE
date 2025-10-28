CodeCraft Backend (Express + MongoDB)

Setup
- Copy ENV_EXAMPLE.txt to .env and set MONGO_URI and PORT (default 4000)
- npm install
- npm run dev

Endpoints
- GET  /health
- GET  /api/projects
- POST /api/projects { id, name }
- GET  /api/projects/:id
- DELETE /api/projects/:id
- POST /api/projects/:id/files { fileId, name, type, parentId, content }
- PUT  /api/projects/:id/files/:fileId (partial update)
- DELETE /api/projects/:id/files/:fileId

Notes
- No auth, no S3. JSON only.
- CORS enabled.

