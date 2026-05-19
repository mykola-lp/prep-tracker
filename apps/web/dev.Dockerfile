FROM node:24

WORKDIR /workspace

COPY package*.json ./
COPY apps/web/package.json apps/web/package.json

RUN npm install

COPY apps/web apps/web

CMD ["npm", "run", "dev:web", "--", "--host", "0.0.0.0"]
