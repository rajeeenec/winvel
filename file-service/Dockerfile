FROM node:20-alpine

WORKDIR /app/file-service

COPY file-service/package.json ./
RUN npm install --omit=dev

COPY file-service/src ./src

RUN mkdir -p uploads

EXPOSE 5001

CMD ["node", "src/server.js"]
