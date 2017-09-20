const config = require('config');

// clean shutdown on `cntrl + c`
process.on('SIGINT', () => process.exit(0))
process.on('SIGTERM', () => process.exit(0))

const express = require('express');
const app = express();
// const router = express.Router();
// const path = require('path');

// Initialize Koop
const Koop = require('koop');
const koop = new Koop();

const cache = require('@koopjs/cache-redis');
koop.register(cache);

const provider = require('./');
koop.register(provider);

const port = process.env.PORT || 3000;

// app.use(koop.server);

koop.server.listen(port, (err) => {
  const message = `

  Now listening on ${port}
  For more docs visit: https://koopjs.github.io/docs/specs/provider/

  Press control + c to exit
  `
  console.log(message);

  // console.log('process.env.PORT', process.env.PORT);
  console.log('process.env.REDIS_URL', process.env.REDIS_URL);

});
