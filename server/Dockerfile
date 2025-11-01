FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install -g nodemon && npm install --include=dev

COPY src/ .

CMD ["npm", "run", "dev"]
