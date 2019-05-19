FROM node:latest

WORKDIR /airmate_web

COPY package.json .
RUN npm i

COPY webpack.config.vendor.js .
RUN npx webpack --config webpack.config.vendor.js

COPY . .

CMD ["npm", "start"]
