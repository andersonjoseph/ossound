FROM node:20 as base

WORKDIR /usr/app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml tsconfig.json ./

RUN pnpm install --frozen-lockfile

COPY . .

FROM base as dev

EXPOSE 8080
CMD pnpm migrations:run && pnpm ts-node ./src/index.ts

FROM base as test

CMD pnpm migrations:run && node --test --require ts-node/register
