// Ask if there ir geolocation available in the navigator. If the answer is yes, display coordenates in index.html.
// Request for current temperature at temp/ end point with lat an lon as a parameters.
if('geolocation' in navigator) {
  console.log('geolocation available');
  navigator.geolocation.getCurrentPosition( async position => {
    try {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      console.log(lat, lon);
      document.getElementById('latitude').textContent = lat.toFixed(3)+'°,';
      document.getElementById('longitude').textContent = lon.toFixed(3)+'°';
      const api_url = `weather/${lat},${lon}`;
      const response = await fetch(api_url);
      const weather = await response.json();
      console.log(weather);
      // Parsing values that will be presented in index.html.
      let city, summary, temp, tempUnit;
      let pm25, pm25Unit;
      if (weather.city == 'Unavailable') {
        city = 'Unavailable';
        summary = 'Unavailable';
        temp = 'Unavailable';
        tempUnit = 'Unavailable';
      } else {
        city = weather.city;
        summary = weather.conditions.WeatherText;
        temp = weather.conditions.Temperature.Metric.Value;
        tempUnit = weather.conditions.Temperature.Metric.Unit;
      };
      console.log(weather.airQuality.results.length);
      if (weather.airQuality.results.length == 0) {
        pm25 = 'Unavailable';
        pm25Unit = 'Unavailable';
      } else {
        pm25 = weather.airQuality.results[0].measurements[1].value;
        pm25Unit = weather.airQuality.results[0].measurements[1].unit;
      }
      document.getElementById('city').textContent = city;
      document.getElementById('summary').textContent = summary;
      document.getElementById('temperature').textContent = temp;
      document.getElementById('tempUnit').textContent = tempUnit;
      document.getElementById('pm25').textContent = pm25;
      document.getElementById('pm25Unit').textContent = pm25Unit;
      
      const data = {lat, lon, city, summary, temp, tempUnit, pm25, pm25Unit};
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      };
      const dbResponse = await fetch('/api', options);
      const dbJson = await dbResponse.json();
      console.log(dbJson);
    } catch(error) {
      console.error(error);
    }
  });
} else {
  console.log('geolocation not available');
}