# Единый образ для сборки и запуска
FROM node:20-alpine

WORKDIR /app

# Копируем все файлы проекта
COPY package.json yarn.lock ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY . .

# Устанавливаем ВСЕ зависимости (и dev, и production)
RUN yarn install --frozen-lockfile

# Генерируем Prisma Client
RUN yarn prisma generate

# Собираем приложение
RUN yarn build

# Указываем порт
EXPOSE 3001

# Запускаем приложение
CMD ["sh", "-c", "yarn prisma db push --accept-data-loss --url \"postgresql://postgres:1234@db:5432/PARSING?schema=public\" && node dist/src/main"]
