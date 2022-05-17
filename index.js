// require() is not part of the standard JavaScript API. But in Node.js, it's a built-in function with a special purpose: to load modules.
import express from 'express';
import Datastore from 'nedb';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const key = process.env.API_KEY;

// We use express to creat a server.
const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Starting server at ${port}`));

app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));

// We use nedb to creat a database.
const database = new Datastore('database.db');
database.loadDatabase();

// How it's handle the get request at /api endpoint.
app.get('/api', (request, response) => {
  database.find({}).sort({"timestamp":-1}).exec((err, data) => {
    if (err) {
      response.end();
      return;
    }
    response.json(data);
  });
});

// How it's handle the post request at /api endpoint.
app.post('/api', (request, response) => {
  console.log('I got a request!');
  const data = request.body;
  const timestamp = Date.now();
  // Inserting the data in our database.
  data.timestamp = timestamp;
  console.log(data);
  database.insert(data);
  // This is the response that will receive the client.
  response.json(data);
});

// The response is the current temperature in lat, lon location.
app.get('/weather/:latlon', async (request, response) => {
  const latlon = request.params.latlon.split(',');
  const lat = latlon[0];
  const lon = latlon[1];
  let city;
  let conditions;
  const locationKey = await getLocationKey(lat, lon);
  if (locationKey=='ServiceUnavailable') {
    city = 'Unavailable';
    conditions = 'Unavailable';
  } else {
    city = locationKey.city;
    conditions = await getConditions(locationKey.geoKey);
  }
  const airQuality = await getAirQuality(lat, lon);
  response.json({city, conditions, airQuality});
});

// AccuWeather API https://developer.accuweather.com/apis
// This is the first step that return a location key that is used to get current temperature.
const getLocationKey = async (lat, lon) => {
  const geoUrl = 'http://dataservice.accuweather.com/locations/v1/cities/geoposition/search';
  const geoParam = `?apikey=${key}&q=${lat},${lon}`;
  const fetch_response = await fetch(geoUrl+geoParam);
  const geoJson = await fetch_response.json();
  console.log(geoJson)
  if (geoJson.Code == 'ServiceUnavailable') {
    return 'ServiceUnavailable';
  } else {
    const geoKey = geoJson.Key;
    const city = geoJson.EnglishName;
    return {geoKey, city};
  }
}

// Using location key obtained in getLocationKey we get the current temperature.
const getConditions = async (locationKey) => {
  const tempUrl = 'http://dataservice.accuweather.com/currentconditions/v1/';
  const tempParam = `${locationKey}?apikey=${key}`;
  const fetch_response = await fetch(tempUrl+tempParam);
  const conditionsJson = await fetch_response.json();
  const conditions = conditionsJson[0];
  return conditions;
}

// OpenAQ API https://docs.openaq.org/
// This is another api where we can get de air quality of a location.
const getAirQuality = async (lat, lon) => {
  const aqUrl = 'https://u50g7n0cbj.execute-api.us-east-1.amazonaws.com/v2/latest';
  const aqParam = `?coordinates=${lat},${lon}`;
  const fetch_response = await fetch(aqUrl+aqParam);
  const airQuality = await fetch_response.json();
  return airQuality;
}