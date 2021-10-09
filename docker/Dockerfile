FROM node:14.15.4-alpine

LABEL Maintainer="Andrew H. <andrewgmholmes@gmail.com>" \
      Description="Flavor Guardian Bot" \
      VERSION="0.1.0"

# ENV
ENV NODE_ENV prod
ENV NODE_PORT 1337

# Create the app directory
WORKDIR /usr/src/app

# Copy the project files
COPY . .

# Install dependencies and build the app
RUN npm --silent install && npm run --silent build:$NODE_ENV

EXPOSE $NODE_PORT

CMD npm run $NODE_ENV