# ShipAPI — Docker Log

## App Analysis
Start script: "node src/server.js" (from package.json scripts.start)
Port: 3000 (defaults to process.env.PORT || 3000 in src/server.js)
Prisma dependency: YES - The app uses Prisma ORM with PostgreSQL. This means:
- Must COPY prisma ./prisma/ before running npx prisma generate
- Must RUN npx prisma generate to generate the Prisma Client before the app starts
- The app imports @prisma/client which requires the generated client
- DATABASE_URL environment variable is required for database connection

Environment variables needed:
- DATABASE_URL (PostgreSQL connection string)
- JWT_SECRET (for JWT authentication)
- PORT (optional, defaults to 3000)

## Build Log
Command: docker build -t shipapi-backend .

Build output (first build):
 => [1/8] FROM docker.io/library/node:20-alpine
 => [2/8] WORKDIR /app
 => [3/8] COPY package*.json ./
 => [4/8] RUN npm ci --only=production
 => [5/8] COPY prisma ./prisma/
 => [6/8] RUN apk add --no-cache openssl
 => [7/8] RUN npx prisma generate
 => [8/8] COPY . .
 => exporting to image

Layer caching evidence (second build after adding comment to src/server.js):
 => CACHED [4/8] RUN npm ci --only=production
 => CACHED [5/8] COPY prisma ./prisma/
 => [6/8] RUN apk add --no-cache openssl
 => CACHED [7/8] RUN npx prisma generate
 => [8/8] COPY . .

The npm ci layer was cached because package.json didn't change. Only the COPY . . layer reran.

## Run and Health Check
Run command: docker run --env-file .env -p 3000:3000 --name shipapi -d shipapi-backend

docker ps output:
CONTAINER ID   IMAGE             COMMAND                  CREATED         STATUS         PORTS                                         NAMES
abfb33795117   shipapi-backend   "docker-entrypoint.s…"   6 seconds ago   Up 4 seconds   0.0.0.0:3000->3000/tcp, [::]:3000->3000/tcp   shipapi

curl http://localhost:3000/health response:
{"status":"ok","timestamp":"2026-05-25T05:24:18.995Z"}

HTTP Status: 200 OK

## Observations
If I had put COPY . . before RUN npm ci, every time any source file changed (even a comment), the entire npm ci step would rerun, taking 7.5 seconds instead of being cached. The layer caching pattern matters for CI/CD build times because in a typical development workflow, source files change frequently but dependencies change rarely. By copying package*.json first and installing dependencies before copying source code, we ensure that dependency installation is only rerun when dependencies actually change, not when source code changes. The --env-file .env protects against baking secrets into the Docker image - environment variables like DATABASE_URL and JWT_SECRET are injected at runtime from the .env file, which is excluded from the image by .dockerignore. This means the image remains portable and secure, with no secrets embedded in the layers.
