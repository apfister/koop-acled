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
const nodeDateTime = require('node-datetime');

const request = require('request').defaults({gzip: true, json: true});

function Model (koop) {}

Model.prototype.getAcledLive = function (req, callback) {
  console.log('getAcledLive');
  callback(null, {});
}

Model.prototype.getData = function (req, callback) {
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
