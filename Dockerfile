# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src/ ./src/
COPY tsconfig.json ./
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist/ ./dist/
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]