FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

ENV NODE_ENV production

RUN npm run develop

EXPOSE 1337

CMD ["npm", "start"]