FROM node:alpine

WORKDIR /app

COPY package.json .

COPY yarn.lock ./

RUN yarn install

COPY . .

RUN yarn prisma generate

EXPOSE 4000

CMD ["yarn", "start"]
