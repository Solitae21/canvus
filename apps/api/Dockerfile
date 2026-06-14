FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.base.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

RUN npm install

COPY apps/api/ ./apps/api/
COPY packages/ ./packages/

WORKDIR /app/apps/api

RUN npm run build

ENV HOST=0.0.0.0

EXPOSE 4000

CMD ["npm", "run", "start"]
