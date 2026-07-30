FROM node:24-slim

WORKDIR /app

COPY package*.json .

RUN npm i

COPY . .

RUN npm run build

EXPOSE 5000

CMD [ "npm", "run", "start:prod"]