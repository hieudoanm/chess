FROM node AS build

LABEL author hieudoanm

ENV PORT=8080

RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY ./package.json /home/node/app/
COPY ./packages/elo /home/node/app/packages/elo
COPY ./services/server /home/node/app/services/server

RUN yarn install
RUN yarn build:server

FROM node:alpine

USER node

COPY --from=build /home/node/app ./

EXPOSE $PORT

CMD ["yarn", "start:server"]
