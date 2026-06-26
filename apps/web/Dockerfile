FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.base.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/shared/package*.json ./packages/shared/

RUN npm install

COPY apps/web/ ./apps/web/
COPY packages/ ./packages/

WORKDIR /app/apps/web

# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so the
# browser-facing API URL must be supplied here (defaults to the published port).
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# Placeholder so `next build` does not fail under NODE_ENV=production; the real
# secret is provided at runtime via the compose environment.
ARG AUTH_SECRET=build-time-placeholder
ENV AUTH_SECRET=$AUTH_SECRET

RUN npm run build

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

CMD ["npm", "run", "start"]
