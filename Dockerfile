# Base image
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
# We need to copy prisma schema to generate client
COPY prisma ./prisma
# Slow/unstable links to registry.npmjs.org often hit EIDLETIMEOUT; relax timeouts and retry.
RUN --mount=type=cache,target=/root/.npm \
    npm config set fetch-retries 10 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm config set fetch-timeout 300000 \
    && npm ci --no-audit --no-fund
RUN npx prisma generate

# Build Next.js
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Supabase environment variables were needed for build in Vercel but we removed them
# Now Prisma needs DATABASE_URL for some build checks? Usually not for `next build` if not executed at build time.
RUN npm run build

# Production image
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# We need prisma client and CLI for migrations at runtime
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=deps /app/node_modules/prisma ./node_modules/prisma
COPY --from=deps /app/node_modules/.bin ./node_modules/.bin

# COPY leaves these owned by root; runtime `prisma db push` must not need to rewrite generated client as nextjs.
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/node_modules/.prisma /app/node_modules/@prisma /app/node_modules/prisma /app/node_modules/.bin /app/prisma /app/data

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
