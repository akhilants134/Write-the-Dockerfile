# Stage 1: Use a specific Node version on Alpine (small Linux distro)
# alpine images are ~50MB instead of ~900MB for full Debian
FROM node:20-alpine

# Set the working directory inside the container
# All subsequent commands run from here
WORKDIR /app

# STEP 1: Copy ONLY the dependency manifests first
# This layer is cached as long as package.json doesn't change
COPY package*.json ./
# package*.json matches both package.json and package-lock.json

# STEP 2: Install dependencies
# npm ci is stricter than npm install — uses lock file exactly
# This layer is cached if package*.json didn't change
RUN npm ci --only=production

# STEP 3: Copy Prisma schema before generating client
COPY prisma ./prisma/

# STEP 4: Install OpenSSL for Prisma engine compatibility on Alpine
RUN apk add --no-cache openssl

# STEP 5: Generate Prisma Client
# Must happen after COPY prisma - reads schema.prisma
# Must happen before app starts - app imports @prisma/client
RUN npx prisma generate

# STEP 6: Copy the rest of the source code
# Source changes only invalidate THIS layer - not npm ci above
COPY . .

# STEP 7: Expose the port (documentation only - does not publish)
EXPOSE 3000

# STEP 8: The command that runs when the container starts
CMD ["node", "src/server.js"]
