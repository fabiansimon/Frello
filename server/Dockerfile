FROM node:18

WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./
RUN yarn install

COPY . .

RUN npx prisma generate

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && yarn start"]
