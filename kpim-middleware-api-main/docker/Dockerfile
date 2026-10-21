FROM node:20.2-slim

WORKDIR /app

COPY ../app .

RUN npm run build

CMD ["node", "./dist/index.js"]