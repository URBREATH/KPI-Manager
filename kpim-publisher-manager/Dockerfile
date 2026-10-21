FROM node:20.2-slim

WORKDIR /app

# Copia package.json e package-lock.json
COPY ../app/package*.json ./

# Installa TUTTE le dipendenze, dev incluse
RUN npm install

COPY ../app .

RUN npm run build

CMD ["node", "./dist/index.js"]
