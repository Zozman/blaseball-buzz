FROM node:17.7.1
WORKDIR /usr/src/app
# Install dumb-init to deal with Docker P1 issues
RUN apt-get update && apt-get -y install dumb-init && apt-get autoremove -y && apt-get clean
# Copy and install node packages so we cache them better
COPY package.json ./
RUN yarn install
COPY . .
# Have Webpack build the UI in production mode
RUN npm run build
# Prune the dev dependencies since we don't need them anymore
RUN npm prune --production
# Start the server
CMD [ "dumb-init", "node", "index.js" ]
