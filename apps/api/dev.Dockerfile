FROM node:24

WORKDIR /workspace

COPY package*.json ./
COPY apps/api/package.json apps/api/package.json

RUN npm install

COPY apps/api apps/api

CMD ["npm", "run", "dev:api"]
