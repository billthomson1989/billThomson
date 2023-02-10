// Variables to store the various layers on the map
let country_boundary;
let map;
let cities_fg;
let wikipedia_fg;
let country_code_global = "";
let country_name;
let lat;
let lng;

// JQuery code to run when the document is ready
$(document).ready(function () {
  // Setting max height of the card body
  $("#country_info .card-body").css("max-height", `${$(window).height() - 81}px`);

  // Initializing the map and setting its view to [0, 0] with zoom level 1.5
  map = L.map("map", {
    attributionControl: false,
  }).setView([0, 0], 1.5);

  // Adding the scale control to the map
  L.control.scale().addTo(map);
  map.zoomControl.setPosition("topright");

  // Adding the OpenStreetMap tile layer to the map
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Initializing the country boundary layer
  country_boundary = new L.geoJson().addTo(map);

  // Initializing the cities layer
  cities_fg = new L.FeatureGroup();
  map.addLayer(cities_fg);

  // Initializing the Wikipedia layer
  wikipedia_fg = new L.FeatureGroup();
  map.addLayer(wikipedia_fg);

  // Fetching the country codes
  get_country_codes();

  // Fetching the user's location
  get_user_location();
});

// Function to fetch the country codes from a PHP file and populate a select list
function get_country_codes() {
  $.ajax({
    url: "php/getCountriesCode.php?",
    type: "GET",
    success: function (json) {
      let countries = JSON.parse(json);
      let option = "";
      for (country of countries) {
        option +=
          '<option value="' + country[1] + '">' + country[0] + "</option>";
      }
      $("#country_list").append(option).select2();
    },
  });
}

// Function to get the user's location using the geolocation API
function get_user_location() {
  // Check if the browser supports the Geolocation API
  if (navigator.geolocation) {
    // Use the geolocation API to get the user's current position
    navigator.geolocation.getCurrentPosition(
      // Success callback function
      function (position) {
        // Destructure the latitude and longitude from the position object
        const { latitude, longitude } = position.coords;
        // Store the latitude and longitude in an array
        const coords = [latitude, longitude];
        // Start the loading spinner
        map.spin(true);
        // Make an AJAX call to the PHP script to get the country code
        $.ajax({
          url: `php/getCountryCodeFromLatLng.php?lat=${latitude}&lng=${longitude}&username=billthomson1989`,
          type: "GET",
          success: function (json) {
            // Stop the loading spinner
            map.spin(false);
            // Parse the string data to a JavaScript object
            json = JSON.parse(json);
            // Extract the country code from the JSON data
            const country_code = json.countryCode;
            // Set the selected value of the country list dropdown to the country code
            $("#country_list").val(country_code).trigger("change");
          },
        });
      },
      // Error callback function
      function () {
        // Show an error message if the position could not be retrieved
        alert("Could not get your position!");
      }
    );
  }
}

// Function to retrieve the border of a specific country
function get_country_border(country_code) {
  // Make an AJAX call to the server to retrieve the border of the country
  $.ajax({
    url: "php/getCountryBorder.php",
    type: "GET",
    data: {
      country_code: country_code
    },
    success: function (json) {
      // Parse the JSON string to a JavaScript object
      json = JSON.parse(json);
      // Clear any existing layers in the country boundary layer
      country_boundary.clearLayers();
      // Add the border data to the country boundary layer and set the style
      country_boundary.addData(json).setStyle(polystyle());
      // Get the bounds of the country boundary layer
      const bounds = country_boundary.getBounds();
      // Zoom the map to fit the bounds of the country boundary layer
      map.fitBounds(bounds);
      // Get the coordinates of the bounds
      const east = bounds.getEast();
      const west = bounds.getWest();
      const north = bounds.getNorth();
      const south = bounds.getSouth();
      // Retrieve the nearby cities
      get_nearby_cities(east, west, north, south);
      // Retrieve the nearby Wikipedia articles
      get_nearby_wikipedia(east, west, north, south);
    },
  });
}

// Function to retrieve nearby cities within the bounds
function get_nearby_cities(east, west, north, south) {
  // Clear any existing layers in the cities feature group
  cities_fg.clearLayers();
  // Make an AJAX call to the server to retrieve the nearby cities
  $.ajax({
    url: "php/getNearByCities.php",
    type: "GET",
    data: {
      east: east,
      west: west,
      north: north,
      south: south,
      username: "billthomson1989",
    },
    success: function (json) {
      // Parse the JSON string to a JavaScript object
      json = JSON.parse(json);
      // Log the JSON data to the console
      console.log(json);
      // Get the city data from the JSON object
      const data = json.geonames;
      // Create an icon for the city markers
      const city_icon = L.ExtraMarkers.icon({
        icon: "fa-building",
        markerColor: "yellow",
        shape: "circle",
        prefix: "fa",
      });
      // Loop through the city data and add markers to the cities feature group
      for (let i = 0; i < data.length; i++) {
        const marker = L.marker([data[i].lat, data[i].lng], {
          icon: city_icon,
        }).bindPopup(
          "<b>" +
          data[i].name +
          "</b><br>Population: " +
          parseInt(data[i].population).toLocaleString("en")
        );
        cities_fg.addLayer(marker);
      }
    },
  });
}

// Function to get nearby Wikipedia articles based on the provided coordinates
function get_nearby_wikipedia(east, west, north, south) {
  // Clear any existing Wikipedia markers from the map
  wikipedia_fg.clearLayers();

  // Send an AJAX GET request to the specified PHP script
  $.ajax({
    url: "php/getNearByWikipedia.php",
    type: "GET",
    data: {
      east: east, // East coordinate
      west: west, // West coordinate
      north: north, // North coordinate
      south: south, // South coordinate
      username: "billthomson1989", // User name
    },
    success: function (json) {
      // Parse the JSON string into a JavaScript object
      json = JSON.parse(json);
      // Log the data to the console for debugging purposes
      console.log(json);

      // Get the array of Wikipedia articles from the data
      const data = json.geonames;
      // Create a custom icon for the Wikipedia markers
      const wiki_icon = L.ExtraMarkers.icon({
        icon: "fa-wikipedia-w", // Icon class
        markerColor: "blue", // Color
        shape: "square", // Shape
        prefix: "fa", // Icon prefix
      });

      // Loop through each Wikipedia article in the data array
      for (let i = 0; i < data.length; i++) {
        // Create a marker for the current article
        const marker = L.marker([data[i].lat, data[i].lng], {
          icon: wiki_icon, // Use the custom icon
        }).bindPopup(
          // The content of the popup for the marker
          "<img src='" +
          data[i].thumbnailImg +
          "' width='100px' height='100px' alt='" +
          data[i].title +
          "'><br><b>" +
          data[i].title +
          "</b><br><a href='https://" +
          data[i].wikipediaUrl +
          "' target='_blank'>Wikipedia Link</a>"
        );
        // Add the marker to the Wikipedia markers layer group
        wikipedia_fg.addLayer(marker);
      }
    },
  });
}

function polystyle() {
  return {
    fillColor: "blue",
    weight: 1,
    opacity: 0.1,
    color: "red", //Outline color
    fillOpacity: 0.1,
  };
}

function zoomToCountry(country_code) {
  if (country_code == "") return;
  country_name = $("#country_list option:selected").text();
  country_code_global = country_code;
  get_country_border(country_code);
  get_country_info(country_code);
}

function get_country_info(country_code) {
  if ($("#country_info").css("left") !== "5px") {
    $("#country_info").animate({
      left: "5px"
    }, 1000);
    $(".pull_country_info_popup").animate({
      left: "-40px"
    }, 1000);
  }
  map.spin(true, {
    top: 180,
    left: 150
  });

  $.ajax({
    url: "php/getCountryInfo.php",
    type: "GET",
    data: {
      country_code: country_code
    },
    success: function (response) {
      map.spin(false);
      let details = $.parseJSON(response);
      console.log(details);
      lat = details.latlng[0];
      lng = details.latlng[1];
      $("#country_name").html(country_name);
      $("#country_capital").html(details.capital);
      $("#country_population").html(details.population);
      $("#country_flag").attr("src", details.flag);
      $("#country_currency").html(details.currencies[0]["name"]);
      $("#country_wikipedia").attr(
        "href",
        "https://en.wikipedia.org/wiki/" + details.name
      );
    },
  });
}

function hide_popup() {
  $("#country_info").animate({
    left: "-999px"
  }, 1000);
  $(".pull_country_info_popup").animate({
    left: "0"
  }, 1000);
}

function show_popup() {
  $("#country_info").animate({
    left: "5px"
  }, 1000);
  $(".pull_country_info_popup").animate({
    left: "-40px"
  }, 1000);
}

function get_covid_data() {
  map.spin(true);
  $.ajax({
    url: "php/getCovidInfo.php",
    type: "GET",
    dataType: "json",
    data: {
      country_code: country_code_global,
    },
    success: function (response) {
      let details = response.response;
      for (let i = 0; i < details.length; i++) {
        $("#covid_total_cases").html(details[i].cases.total);
        $("#covid_active").html(details[i].cases.active);
        $("#covid_recovered").html(details[i].cases.recovered);
        $("#covid_deaths").html(details[i].deaths.total);
        $("#covid_todayCases").html(details[i].cases.new);
      }
      map.spin(false);
      $("#coronoModal").modal();
    },
  });
}
function get_weather_data() {
  map.spin(true);
  $.ajax({
    url: "php/getWeatherInfo.php",
    type: "GET",
    data: {
      lat: lat,
      lng: lng
    },
    success: function (response) {
      let details = $.parseJSON(response);
      console.log(details);
      $("#first_row").html("");
      $("#second_row").html("");
      $("#third_row").html("");
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      for (let i = 0; i < 5; i++) {
        const d = details["daily"][i];
        const day = days[new Date(d["dt"] * 1000).getDay()];
        $("#first_row").append("<td>" + day + "</td>");
        $("#second_row").append("<td>" + parseInt(d["temp"]["max"]) + "°</td>");
        $("#third_row").append("<td>" + parseInt(d["temp"]["min"]) + "°</td>");
      }
      $("#weather_city_name").html(details.timezone);
      let daily = details["daily"][0]["weather"][0];
      $("#weather_description").html(
        daily["main"] +
        "<span>Wind " +
        parseInt(details["daily"][0]["wind_speed"]) +
        "km/h <span class='dot'>•</span> Precip " +
        details["daily"][0]["clouds"] +
        "%</span></h3>"
      );
      $("#weather_data img").attr(
        "src",
        "https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/" +
        daily["icon"] +
        ".svg"
      );
      $("#weather_data .image_parent h1").html(
        parseInt(details["daily"][0]["temp"]["day"]) + "°"
      );
      map.spin(false);
      $("#weatherModal").modal();
    },
  });
}
function get_news_data() {
  $("#news_data").html("");
  map.spin(true);
  $.ajax({
    url: "php/getNewsInfo.php",
    data: {
      country_name: country_name
    },
    method: "GET",
    success: function (response) {
      response = JSON.parse(response);
      console.log(response);
      const data = response["articles"];
      for (let i = 0; i < data.length; i++) {
        $("#news_data").append(get_news_card(data[i]));
      }
      map.spin(false);
      $("#newsModal").modal();
    },
  });
}

function get_news_card(data) {
  const card =
    '<div class="card" style="width: 20rem;"> <img class="card-img-top" src="' +
    data["urlToImage"] +
    '" alt="News Image"> <div class="card-body"> <h5 class="card-title">' +
    data["author"] +
    '</h5> <p class="card-text">' +
    data["title"] +
    '</p> <a href="' +
    data["url"] +
    '" target="_blank" class="btn btn-primary">Details</a> </div> </div>';
  return card;
}