/*
  model.js

  This file is required. It must export a class with at least one public function called `getData`

  Documentation: http://koopjs.github.io/docs/specs/provider/
*/
require('dotenv').config();

const request = require('request').defaults({gzip: true, json: true});

function Model (koop) {}

Model.prototype.getData = function (req, callback) {

  // get today's date
  const rightNow = new Date();

  const rightNowFormatted = formatDate(rightNow);

  // check to see if latest data is cached
  // if cached -> return that;
  // if not cached -> request;
  if (koop.cache[rightNowFormatted]) {
    callback( null, koop.cache[rightNowFormatted] );
  } else {
    const url = config.urls.latest;

    request(url, (err, res, body) => {
      if (err || (res.statusCode > 400 && res.statusCode < 600)) {
        return callback({
          message: 'error requesting data from acled',
          status_code: res.statusCode
        });
      }

      data = translateCsvToGeoJson(body);

      callback( null, data);

    });
  }
}

function translateCsvToGeoJson (raw) {
    // convert to csv object

    // convert to GeoJson
    return geojson;
}
