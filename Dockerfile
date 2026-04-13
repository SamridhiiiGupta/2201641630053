FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src/ src/
COPY --from=frontend-builder /app/frontend/dist frontend/dist/

RUN mkdir -p logs data

ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000
CMD ["node", "src/index.js"]
