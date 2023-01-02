FROM node:12.18.0-alpine as builder

WORKDIR /usr/src/joolia-server
COPY . .
RUN npm ci && npm run build

FROM nexus.msg-gbp-ci:8082/joolia-node:12.18.0-stretch

ARG BUILD_SIGNATURE
ENV BUILD_SIGNATURE=${BUILD_SIGNATURE}

WORKDIR /joolia-server
COPY --from=builder /usr/src/joolia-server/node_modules ./node_modules/
COPY --from=builder /usr/src/joolia-server/dist/src ./dist/src/
COPY --from=builder /usr/src/joolia-server/dist/db ./dist/db/

EXPOSE 3000
ENTRYPOINT  ["/usr/local/bin/node", "dist/src"]
