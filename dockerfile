FROM node:lts AS client-build

WORKDIR /usr/src/client

COPY client/package*.json ./

RUN npm install

COPY client ./

RUN npm run build

 

# Stage 2: Build the server

FROM node:lts AS server-build

WORKDIR /usr/src/server

COPY server/package*.json ./

RUN npm install

COPY server ./

 

EXPOSE 3459

 

CMD [ "node", "index.js" ]