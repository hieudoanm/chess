# syntax=docker/dockerfile:1

# =============================================================================
# tourney - Touraments - Touraments Manager
#
# The web build is a Next.js static export (`output: 'export'`, produced into
# `out/`). It has no Node server, so the production image simply serves the
# export with an unprivileged nginx. Build from the package directory:
#
#   docker build -t tourney .
#   docker run --rm -p 8080:8080 tourney
#
# Multi-stage: base (node) -> deps (install) -> builder (static export) ->
# runner (unprivileged nginx).
# =============================================================================

ARG NODE_VERSION=26.11.1
ARG NGINX_VERSION=1.31.6

# ---- base ------------------------------------------------------------------
# Node runtime with pnpm (via corepack). Dependencies in package.json are
# exact-pinned, so installs are deterministic without a committed lockfile.
FROM node:${NODE_VERSION}-alpine AS base
RUN corepack enable pnpm
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# ---- deps ------------------------------------------------------------------
# Install dependencies. Only package.json is copied first so this layer is
# cached until a dependency changes.
FROM base AS deps
COPY package.json ./
RUN pnpm install

# ---- builder ---------------------------------------------------------------
# Rebuild the static export only when source changes.
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ---- runner ----------------------------------------------------------------
# Serve the static `out/` export with an unprivileged, non-root nginx
# (listens on 8080). 1.27.4 pin avoids a 1.27.5 /run/nginx.pid regression.
FROM nginxinc/nginx-unprivileged:${NGINX_VERSION}-alpine
LABEL org.opencontainers.image.title="tourney"
LABEL org.opencontainers.image.description="Touraments - Touraments Manager"
LABEL org.opencontainers.image.source="https://github.com/hieudoanm/chess"
COPY --from=builder /app/out/ /usr/share/nginx/html/
EXPOSE 8080
HEALTHCHECK CMD wget -q -O - http://127.0.0.1:8080/ >/dev/null || exit 1
CMD ["nginx", "-g", "daemon off;"]
