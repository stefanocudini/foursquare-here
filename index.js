#!/usr/bin/env node
/*
  https://developer.foursquare.com/docs/api/getting-started
*/
const request = require('request');
const publicIp = require('public-ip');
const geoip = require('geoip-lite');
const dateformat = require('dateformat');

const path = require('path');
const ini = require('ini');
const fs = require('fs');
const os = require('os');

var configFile = path.join(os.homedir(), '.foursquare-here.ini'),
    config = {
      foursquare: {
        client_id: '',
        client_secret: ''
      }
    };

if(!fs.existsSync(configFile)) {
  console.warn("\nCreation of empty config: "+ configFile);
  console.warn("\nfill using your API auth data, https://it.foursquare.com/developers/apps\n\n");
  fs.writeFileSync(configFile, ini.stringify(config) );
}

config = ini.parse(fs.readFileSync(configFile, 'utf-8'));

module.exports = {

  init: function(keyword) {

    publicIp.v4().then(function(ip) {
      
      var geo = geoip.lookup(ip);

      console.log('My Location: ', ip, geo.city, geo.ll);

      request({
        url: 'https://api.foursquare.com/v2/venues/explore',
        method: 'GET',
        qs: {
          query: keyword,
          client_id: config.foursquare.client_id,
          client_secret: config.foursquare.client_secret,
          ll: geo.ll.join(','),
          v: dateformat(new Date(),'yyyymmdd'),
          limit: 1
        }
      }, function(err, res, body) {

        if (err) {
          console.error(err);

        } else {
          
          var out = JSON.parse(body).response.groups[0].items[0].venue;

          console.log( JSON.stringify(out,null,4) );
        }
      });

        
    });
  }
};