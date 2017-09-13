require('dotenv').config();

// clean shutdown on `cntrl + c`
process.on('SIGINT', () => process.exit(0))
process.on('SIGTERM', () => process.exit(0))

const express = require('express');
const app = express();
const router = express.Router();
const path = require('path');

// Initialize Koop
const Koop = require('koop');
const koop = new Koop();

const provider = require('./');
koop.register(provider);

const port = process.env.PORT || 3000;

app.use(koop.server);

app.listen(port, (err) => {
  const message = `

  SDG API listening on ${port}
  For more docs visit: https://koopjs.github.io/docs/specs/provider/

  Try it out in your browser: http://localhost:${port}/sdgs/goals/1
  Or on the command line: curl --silent http://localhost:${port}/sample/FeatureServer/0/query?returnCountOnly=true

  Press control + c to exit
  `
  console.log(message);
  
});
