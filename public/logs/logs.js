// This code is to control the requests that we do to a database.

// Making a map and tiles
const mymap = L.map('checkinMap').setView([0, 0], 1);
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
//we initialize the map and set its view to our chosen geographical coordinates and a zoom level
const tiles = L.tileLayer(tileUrl, {attribution});
tiles.addTo(mymap);

getData();

// Get request to a endpoint /api.
async function getData() {
  const response = await fetch('/api');
  const data = await response.json();

  for (item of data) {
    const marker = L.marker([item.lat, item.lon])
    marker.addTo(mymap);
    const txt = `${item.city} (${item.lat.toFixed(3)}°, ${item.lon.toFixed(3)}°)<br>
    ${new Date(item.timestamp).toLocaleString()}<br>
    ${item.summary}, ${item.temp} °${item.tempUnit}<br>
    pm25: ${item.pm25} ${item.pm25Unit}`

    marker.bindPopup(txt);
    
//     const root = document.createElement('p');
//     const geo = document.createElement('div');
//     const date = document.createElement('div');
//     const summary = document.createElement('div');
//     const temp = document.createElement('div');
//     const airQuality = document.createElement('div');

//     geo.textContent = `${item.city} (${item.lat.toFixed(3)}°, ${item.lon.toFixed(3)}°)`;
//     const dateString = new Date(item.timestamp).toLocaleString();
//     date.textContent = dateString;
//     summary.textContent = item.summary;
//     temp.textContent = `${item.temp} °${item.tempUnit}`;
//     airQuality.textContent = `pm10: ${item.pm10} ${item.pm10Unit}, pm25: ${item.pm25} ${item.pm25Unit}`;

//     root.append(geo, date, summary, temp, airQuality);
//     container.append(root);
  }
console.log(data);
}