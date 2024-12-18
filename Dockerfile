FROM node:20-alpine

RUN apk add tor chromium

WORKDIR /usr/local/lectio-skema
COPY * .

RUN npm install 

#RUN npm audit fix --force

EXPOSE 9002

CMD ["npm", "start"]
