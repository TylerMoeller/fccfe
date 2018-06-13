$(document).ready(function () {
  getWeather();

  // add a spinner icon to areas where data will be populated
  $('#condition').html('<i class="fa fa-spinner fa-pulse fa-3x"></i>');
  $('#wind-speed').html('<i class="fa fa-spinner fa-pulse fa-3x"></i>');
});

// Array for autocomplete cities and their weather stations
var cities = [];

// Get the weather from the Weather Underground API
function getWeather(weatherStation) {
  var backgroundImgUrl = 'https://tylermoeller.github.io/local-weather-app/assets/img/',
      apiBaseUrl = 'https://api.wunderground.com/api/d2e6b90fe3579205/conditions';

  // Build the appropriate URL if a specific city's weather station was requested.
  if (!weatherStation) {
    weatherApi = apiBaseUrl + '/q/autoip.json';
  } else {
    weatherApi = apiBaseUrl + weatherStation + '.json';
  }

  // Call the API
  $.getJSON(weatherApi).done(function (json) {
    var weatherData = json.current_observation,
        locData = weatherData.display_location,
        condition = weatherData.weather,
        windSpeed = Number((weatherData.wind_mph * 0.86897624190816).toFixed(1)), //mph to knots
        windDir = weatherData.wind_dir;

    // Values for the convert button
    tempF = weatherData.temp_f,
    tempC = weatherData.temp_c;

    // If location has a value for "state", use it, otherwise use: city, country.
    if (locData.state !== '') {
      $('#city').text(locData.city + ', ' + locData.state + ', ' + locData.country_iso3166);
    } else {
      $('#city').text(locData.city + ', ' + locData.country_iso3166);
    }

    // categorize weather conditions to determine background image and icons
    switch (true) {
      case /thunderstorm|hail/i.test(condition):
        display = 'thunderstorm';
      break;
      case /drizzle|light rain/i.test(condition):
        display = 'sprinkle';
      break;
      case /rain|squalls|precipitation/i.test(condition):
        display = 'rain';
      break;
      case /snow|ice|freezing/i.test(condition):
        display = 'snow';
      break;
      case /overcast|mist|fog|smoke|haze|spray|sand|dust|ash/i.test(condition):
        display = 'fog';
      break;
      case /cloud/i.test(condition):
        display = 'cloudy';
      break;
      default:
        display = 'clear';
        if (!condition) condition = 'clear'; // handle undefined cases
      break;
    }

    // Update background, wind speed, and icons based on weather conditions
    $('body').css('background-image', 'url(' + backgroundImgUrl + display + '.jpg)');
    if (display === 'clear') {
      $('#condition').html(
        '<i class="wi wi-night-' + display + '"></i><br><span class="description">' +
         condition + '</span>'
       );
    } else {
      $('#condition').html(
        '<i class="wi wi-' + display + '"></i><br><span class="description">' +
        condition + '</span>'
      );
    }

    $('#wind-speed').html(
      '<i class="wi wi-wind wi-from-' + windDir.toLowerCase() + '"></i>' +
      '<br><span class="description">' + windDir + ' ' + windSpeed + ' knots</span>'
    );

    //determine F or C based on country and add temperature to the page.
    var fahrenheit = ['US', 'BS', 'BZ', 'KY', 'PL'];
    if (fahrenheit.indexOf(locData.country_iso3166) > -1) {
      $('#temperature').text(tempF + '° F');
    } else {
      $('#temperature').text(tempC + '° C');
    }

    // Scroll to the top of the page and remove focus from the
    // search field to hide the keyboard on mobile
    scroll(0, 0);
    $('#search-field').blur();

  }).fail(function (err, json) {
    alert('There was an error retrieving your weather data. \n' +
          'Please try again later or try a different city.');
  });
}

$('#search-field').autocomplete({
  autoFocus: false,
  delay: 500,
  focus: function (event, ui) {
    $('#search-field').val(ui.item.value);
  },

  minLength: 3,
  open: function () {
    // prevent the need for double-tap on mobile to select menu item
    $('.ui-autocomplete').off('menufocus hover mouseover');
  },

  select: function (event, ui) {
    getWeather(cities[cities.indexOf(ui.item.value) + 1]);
  },

  source: cities,
})
.keyup(function (e) {
  var key = e.keyCode || e.which,
      cityAutoComplete = 'https://autocomplete.wunderground.com/aq?cb=?&query=' +
                        $('#search-field').val();

  // clear search field when user presses esc
  if (key === 27) $('#search-field').val('');

  // Update the autocomplete list when there are more than 2 characters and
  // the user enters a backspace, space, comma, period, or letter.
  if ($('#search-field').val().length > 2 &&
     (key === 8 | key === 32 | key === 44 | key === 46) |
     (key >= 65 && key <= 90) | (key >= 97 && key <= 122)) {

    cities.length = 0; // clear the array for a new list of cities

    // Push all autocomplete values to the cities array with their corresponding weather stations.
    // Limit to 20 non-duplicate entries. The API also allows searches for "snow", for example,
    // so we only allow values with a comma to show up in the autocomplete list.
    $.getJSON(cityAutoComplete).done(function (data) {
      $.each(data.RESULTS, function (i) {
        var city = data.RESULTS[i].name;
        if (city.indexOf(',') > -1 && cities.indexOf(city) < 0)  {
          cities.push(city, data.RESULTS[i].l);
        }
      });
    })
    .fail(function (err) {
      console.log('Error: ' + JSON.stringify(err));
    });
  }
});

//toggle between celsius / fahrenheit
$('#convert-button').click(function () {
  this.blur(); // remove focus from the button after click
  if ($('#temperature').text().indexOf('F') > -1) {
    $('#temperature').text(tempC + '° C');
  } else {
    $('#temperature').text(tempF + '° F');
  }
});

$('#search-field').click(function () {
  $(this).val('');
  $('#search').autocomplete('close');
});
