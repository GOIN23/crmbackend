# Стадия 1: Установка зависимостей и сборка
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
COPY prisma ./prisma/

RUN yarn install --frozen-lockfile
RUN npx prisma generate

COPY . .
RUN yarn build

# Стадия 2: Финальный образ
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

CMD sh -c "npx prisma db push && yarn start:prod"