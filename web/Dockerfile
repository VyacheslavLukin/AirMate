FROM node:latest

RUN npm install webpack -g

WORKDIR /airmate_web

# add `/app/node_modules/.bin` to $PATH
# ENV PATH /airmate_web/node_modules/.bin:$PATH

COPY package.json .
RUN npm config set registry http://registry.npmjs.org/ && npm install

# COPY webpack.config.vendor.js .
# RUN npx webpack --config webpack.config.vendor.js

RUN webpack

ENV NODE_ENV=development
ENV PORT=3000

COPY . .

CMD ["npm", "start"]
EXPOSE 3000
