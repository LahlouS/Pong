# =========== development ===========

FROM		node:19-alpine As development

RUN			npm install -g npm@latest

WORKDIR /app

COPY --chown=node:node package*.json ./

RUN npm ci

COPY --chown=node:node . .

USER node

# =========== build for production ===========

FROM node:19-alpine As build

RUN			npm install -g npm@latest

WORKDIR /app

COPY --chown=node:node package*.json ./

COPY --chown=node:node --from=development /app/node_modules ./node_modules

COPY --chown=node:node . .

#RUN npm run build

ENV NODE_ENV production

#RUN npm ci --only=production && npm cache clean --force

EXPOSE		3500

ENTRYPOINT ["sh", "/app/entrypoint-server.sh"]
