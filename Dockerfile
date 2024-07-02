FROM node:18

WORKDIR /home/node/app

COPY package*.json ./
COPY audit.js ./

RUN npm install

# Bundle app source
COPY . .

CMD 'node audit.js'