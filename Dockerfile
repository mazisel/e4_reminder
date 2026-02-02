FROM node:20-slim AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install necessary build tools for native modules if needed
RUN apt-get update && apt-get install -y openssl

# Install dependencies
COPY package.json package-lock.json* ./
# Use npm install instead of ci to ensure platform specific optional deps are installed correctly
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Generate Prisma Client
RUN npx prisma generate

# Increase memory limit for build
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 6090

ENV PORT 6090
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
