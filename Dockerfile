FROM node:8

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install -S express
RUN npm install mysql --save
RUN npm install body-parser --save
RUN npm install express-myconnection --save
RUN npm install winston --save
RUN npm install winston-daily-rotate-file --save
RUN npm install date-utils --save
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "npm", "start" ]
