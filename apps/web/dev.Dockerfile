FROM node:24

WORKDIR /workspace

COPY package*.json ./
COPY apps/web/package.json apps/web/package.json

RUN npm install --ignore-scripts

COPY apps/web apps/web

CMD ["npm", "run", "dev", "--workspace", "@prep-tracker/web", "--", "--host", "0.0.0.0", "--port", "5173"]
