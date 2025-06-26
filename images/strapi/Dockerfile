FROM node:18-alpine

RUN apk add --no-cache \
      build-base \
      python3 \
      cairo-dev \
      pango-dev \
      jpeg-dev \
      giflib-dev \
      librsvg-dev \
      vips-dev

WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

ENV NODE_ENV production

RUN npm run build

EXPOSE 1337

CMD ["npm", "start"]