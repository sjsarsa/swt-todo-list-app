FROM node:lts-alpine3.19

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

# Install dependencies

RUN npm install --global serve

COPY *.json ./
COPY *.mjs ./

RUN npm ci

# Copy source files and build

COPY src ./src
COPY public ./public

RUN npm run build

ENV NODE_ENV production

CMD ["serve", "./dist/"]
