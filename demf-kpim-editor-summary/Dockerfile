FROM node:16.14.0-alpine3.14 as build-stage
WORKDIR /app

COPY app/package*.json ./

RUN npm install
COPY app ./
RUN npm run build

# Serve con nginx
FROM nginx:alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
