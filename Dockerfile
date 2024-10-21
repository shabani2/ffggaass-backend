FROM node:alpine3.20
WORKDIR /WORKDIR
COPY . .
RUN npm install
EXPOSE 9091
CMD [ "npm", "run", "start" ]
