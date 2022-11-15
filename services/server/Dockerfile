FROM node AS build

LABEL author hieudoanm

ARG node_token
ENV NODE_TOKEN=$node_token
ENV PORT=8080

RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY . /home/node/app

RUN yarn install
RUN yarn build

FROM node:alpine

USER node

COPY --from=build /home/node/app ./

EXPOSE $PORT

CMD ["yarn", "start:server"]
