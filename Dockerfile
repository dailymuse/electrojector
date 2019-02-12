FROM node:10-alpine

WORKDIR /conflator

COPY . .

RUN apk add --no-cache bash

RUN apk add --no-cache git

RUN yarn install