FROM node:latest

WORKDIR /
COPY /src/package.json package.json
COPY /src/package-lock.json package-lock.json

RUN npm install

COPY src/. .
EXPOSE 3000

CMD ["node", "index.js"]