<div align="center">

![Icon](src/images/icon.svg)

</div>

# Blaseball Buzz

A web app for transmitting [Blaseball](https://blaseball.com) games using [Morse Code](https://en.wikipedia.org/wiki/Morse_code).

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

[![Run on Google Cloud](https://deploy.cloud.run/button.svg)](https://deploy.cloud.run)

## Features

- Select your favorite team
- Receive both audio and visual morse code of game updates
- Compatible with both [SIBR](https://sibr.dev) and [Blaseball](https://blaseball.com) Event Streams

## Enviromental Variables

- `PORT`: What port the web server will run on. Defaults to `8080`.
- `EVENT_STREAM`: The Event Steam the application will subscribe to. Defaults to `https://api.sibr.dev/corsmechanics/api.blaseball.com/events/streamData`.
- `SIESTA_MESSAGE`: If set to a string, the application will display a Siesta attribute in the header with the message provided on hover of the Siesta Attribute. Useful for communicating when we're in the off-season and using a different `EVENT_STREAM` than the live one.

## Running

### Run Using NodeJs

First install all npm modules:

```
npm install
```

Then start the application:

```
npm run local
```

### Run Using Docker

The easiest way to run using Docker is to use Docker Compose:

```
docker-compose up
```

The app can also be run using the `Dockerfile`.

### Development

To run the dev server, first install all npm dependencies:

```
npm install
```

Then start the development server:

```
npm run dev
```

The dev server will serve a mock `/settings` endpoint that can be modified in the `webpack.config.js` file.

### Built for the [SIBR Cursed Blaseball Viewer Competiton](https://cursed.sibr.dev)
