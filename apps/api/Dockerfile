FROM node:24-bullseye-slim

WORKDIR /usr/src/app

COPY package*.json ./
COPY apps/api/package.json apps/api/package.json

RUN npm ci --omit=dev --ignore-scripts

COPY apps/api apps/api

ENV NODE_ENV=production

EXPOSE 3001

CMD ["npm", "run", "start", "--workspace", "@prep-tracker/api"]
