# Next.js console — production image.
#
# Why not `output: "standalone"`: this repo installs with pnpm, whose node_modules
# is a symlink farm into `.pnpm/`. Next's standalone file tracing is a known source
# of "Cannot find module" at runtime with that layout, and this image only has to
# run locally for the assessment. Copying the installed tree is boring and works.
# (If you ever want a ~250 MB image instead of ~1 GB, add `output: "standalone"`,
# install with `--config.node-linker=hoisted`, and ship `.next/standalone`.)
#
# Build-time vs run-time: there are NO NEXT_PUBLIC_* values in this app, so nothing
# secret is baked into the bundle. NIMBUS_API_URL and AGENT_TOKEN are read on the
# server at request time and are supplied by compose.

FROM node:22-slim AS deps
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
# Only the manifests, so a dependency change does not invalidate the app layer.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# No API needed at build time: request-time data sits behind Suspense boundaries.
RUN ./node_modules/.bin/next build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
# The whole built app: .next, public, node_modules, next.config.ts and proxy.ts.
COPY --from=builder --chown=node:node /app ./
USER node
EXPOSE 3000
CMD ["./node_modules/.bin/next", "start", "-H", "0.0.0.0", "-p", "3000"]
