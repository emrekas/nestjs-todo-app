# add the Node.js docker image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
COPY . . 
EXPOSE 3005

RUN npx prisma generate
CMD [ "npm", "run", "start:dev" ]