FROM node:16.5.0
WORKDIR /usr/src/app
# Install dumb-init to deal with Docker P1 issues
RUN apt-get update && apt-get -y install dumb-init && apt-get autoremove -y && apt-get clean
# Copy and install node packages so we cache them better
COPY package.json ./
RUN npm install
COPY . .
# Have Webpack build the UI
RUN npm run build
# Start the server
CMD [ "dumb-init", "node", "index.js" ]