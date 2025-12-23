FROM node:20-alpine AS base
WORKDIR /workspace

COPY package.json ./
COPY api/package.json ./api/package.json
COPY web/package.json ./web/package.json
COPY infra/package.json ./infra/package.json

RUN npm install

COPY . .

RUN npm run prisma:generate -w api
RUN npm run build -w api

FROM node:20-alpine
WORKDIR /workspace

COPY --from=base /workspace/package.json ./
COPY --from=base /workspace/node_modules ./node_modules
COPY --from=base /workspace/api/dist ./api/dist
COPY --from=base /workspace/api/package.json ./api/package.json
COPY --from=base /workspace/api/prisma ./api/prisma

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "api/dist/index.js"]
