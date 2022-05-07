FROM node:16-alpine
RUN apk --no-cache add shadow bash curl --virtual builds-deps build-base python3

WORKDIR /app
COPY . ./
RUN yarn install --frozen-lockfile --non-interactive --production=false && yarn build

CMD ["node", "build/src/index.js"]

EXPOSE 8000
