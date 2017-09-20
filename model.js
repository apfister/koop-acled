/*
  model.js

  This file is required. It must export a class with at least one public function called `getData`

  Documentation: http://koopjs.github.io/docs/specs/provider/
*/
const config = require('config');

const fs = require('fs');
const AdmZip = require('adm-zip');
const http = require('http');
const url = require('url');
const csv2geojson = require('csv2geojson');
const moment = require('moment');

const request = require('request').defaults({gzip: true, json: true});

function Model (koop) {}

Model.prototype.getAcledLive = function (req, callback) {
  console.log('getAcledLive');
  callback(null, {});
}

Model.prototype.getData = function (req, callback) {
  const rightNow = moment().format();
  console.log(`entering getData -- ${rightNow}`);
  const api_url = config.urls.api;
  console.log(`requesting latest file from api @ ${api_url}`);

  request(api_url, (err, res, body) => {

    if (err) {
      return callback(err);
    }

    console.log(`returned with ${res.body.data.length} features`);
    const events = translate(res.body);
    events.ttl = 60;
    events.metadata = {
      name: 'acled events test',
      description: 'test description'
    };

    callback(null, events);

  });
}

function translate(events) {
  // const events = JSON.parse(data);

  const featureCollection = {
    type: 'FeatureCollection',
    features: []
  };

  if (events.success && events.data) {
    featureCollection.features = events.data.map(formatFeature);
  }
  return featureCollection;
}

function formatFeature(event) {
  const feature = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [event.longitude, event.latitude]
    },
    properties: {
      data_id: event.data_id,
      gwno: event.gwno,
      event_id_cnty: event.event_id_cnty,
      event_id_no_cnty: event.event_id_no_cnty,
      event_date: event.event_date,
      year: event.year,
      time_precision: event.time_precision,
      event_type: event.event_type,
      actor1: event.actor1,
      ally_actor_1: event.ally_actor_1,
      inter1: event.inter1,
      actor2: event.actor2,
      ally_actor_2: event.ally_actor_2,
      inter2: event.inter2,
      interaction: event.interaction,
      country: event.country,
      admin1: event.admin1,
      admin2: event.admin2,
      admin3: event.admin3,
      location: event.location,
      latitude: event.latitude,
      longitude: event.longitude,
      geo_precision: event.geo_precision,
      source: event.source,
      notes: event.notes,
      fatalities: event.fatalities,
      timestamp: event.timestamp
    }
  };

  return feature;
}

Model.prototype.getDataZip = function (req, callback) {
  console.log('getData');
  const file_url = config.urls.latest;
  console.log(`requesting csv zip file from: ${file_url}`);

  const options = {
    host: url.parse(file_url).host,
    port: 80,
    path: url.parse(file_url).pathname
  };

  http.get(options, (res) => {
    let data = [], dataLen = 0;

    res
      .on('data', (chunk) => {
        data.push(chunk);
        dataLen += chunk.length;
      })
      .on('end', ()  => {
        const buf = new Buffer(dataLen);

        for (let i=0, len = data.length, pos = 0; i < len; i++) {
          data[i].copy(buf, pos);
          pos += data[i].length;
        }

        const zip = new AdmZip(buf);

        const zipEntries = zip.getEntries();

        // console.log(zipEntries.length);

        const csvString = zip.readAsText(zipEntries[0]);

        csv2geojson.csv2geojson(csvString, {
          latfield: 'LATITUDE',
          lonfield: 'LONGITUDE',
          delimiter: ','
        }, function(err, data) {

          const rightNow = nodeDateTime.create().format('Y-m-d H:M:S');
          console.log(rightNow);

          data.features.forEach( (feature) => {
            feature.properties.DATETIME_IMPORTED = rightNow;
          });

          callback( null, data );
        });

      });
  })
  .on('error', (error) => {
    console.log('error', error);
  });
}

module.exports = Model;
