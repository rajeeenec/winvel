FROM node:20-alpine

WORKDIR /app/backend

COPY backend/package.json ./
RUN npm install --omit=dev

COPY backend/src ./src
COPY database /app/database

RUN mkdir -p uploads/logos

EXPOSE 5000

CMD ["node", "src/server.js"]
