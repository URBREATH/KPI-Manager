# Fase di build (Node.js)
FROM node:16.14.0-alpine3.14 as build-stage
WORKDIR /app

COPY app/package*.json ./
RUN npm install
COPY app ./ 
RUN npm run build

# Fase di produzione (Nginx)
FROM nginx:alpine as production-stage
# Copia il file di configurazione di Nginx personalizzato
COPY nginx.conf /etc/nginx/nginx.conf

# Copia i file statici dalla fase di build nella directory di Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html/

EXPOSE 8080

# Avvia Nginx in primo piano
CMD ["nginx", "-g", "daemon off;"]
