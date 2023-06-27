FROM node:20 as base

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

COPY . .

FROM base as dev
EXPOSE 8080
CMD [ "npx", "ts-node", "./src/index.ts" ]

FROM base as test

CMD npm run migrations:run && node --test --require ts-node/register
