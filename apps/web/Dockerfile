FROM node:24 AS build-stage

WORKDIR /usr/src/app

COPY package*.json ./
COPY apps/web/package.json apps/web/package.json

RUN npm ci

COPY apps/web apps/web

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build --workspace @prep-tracker/web

FROM nginx:1.29-alpine

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /usr/src/app/apps/web/dist /usr/share/nginx/html

EXPOSE 80
