FROM node:latest

WORKDIR /airmate_web

# add `/app/node_modules/.bin` to $PATH
# ENV PATH /airmate_web/node_modules/.bin:$PATH

COPY package.json .
RUN npm i

# COPY webpack.config.vendor.js .
# RUN npx webpack --config webpack.config.vendor.js

COPY . .

CMD ["npm", "start"]
