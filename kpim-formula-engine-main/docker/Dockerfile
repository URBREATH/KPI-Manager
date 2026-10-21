FROM node:20.2-slim

WORKDIR /app

COPY ../app .

RUN npm run build

RUN cp src/services/computeEngineClient.js dist/services/computeEngineClient.js


CMD ["node", "./dist/index.js"]
