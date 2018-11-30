FROM node:8

# Create app directory
WORKDIR /usr/src/app

ENV FIREBASE_DATABASE_URL https://habla-215902.firebaseio.com

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]