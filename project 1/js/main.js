// Variables to store the various layers on the map
let country_boundary;
let map;
let wikipedia_fg;
let cities_fg;
let country_code_global = "";
let country_name;
let lat;
let lng;

$(window).on('load', function () {
  if ($('#preloader').length) {
  $('#preloader').delay(1000).fadeOut('slow', function () {
  $(this).remove();
  });
  }
  });

// Initializing the map and setting its view to [0, 0] with zoom level 1.5
map = L.map("map").setView([0, 0], 1.5);

const CustomAttributionControl = L.Control.Attribution.extend({
  options: {},
  // You can override other methods or add new methods here as needed.
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);


// Initializing the country boundary layer
country_boundary = new L.geoJson().addTo(map);

// Initializing the marker cluster layer
let markers = L.markerClusterGroup();
map.addLayer(markers);

// Initializing the Wikipedia layer
wikipedia_fg = new L.featureGroup().addTo(map);

// Initializing the cities layer
cities_fg = new L.featureGroup().addTo(map);

// Fetching the country codes
get_country_codes();

// Fetching the user's location
get_user_location();

async function get_country_codes() {
  try {
    const response = await fetch("php/getCountriesCode.php");
    const countries = await response.json();
    let option = "";
    for (const country of countries) {
      option += `<option value="${country.iso}">${country.name}</option>`;
    }
    const $select = $("#country_list");
    $select.append(option).on('keydown', function (e) {
      // If a letter key is pressed, scroll to the first matching country
      if (e.which >= 65 && e.which <= 90) {
        const key = String.fromCharCode(e.which).toLowerCase();
        const $options = $select.find('option');
        const index = $options.filter(function () {
          return $(this).text().toLowerCase().indexOf(key) === 0;
        }).first().index();
        if (index >= 0) {
          $select[0].selectedIndex = index;
        }
      }
    });
    // Attach an event listener to the select element
    $select.on("change", function (e, skipFunctions = false) {
      const country_code = $(this).val();
      if (!skipFunctions) {
        get_country_info(country_code);
        get_country_border(country_code);
      }
    });
  } catch (error) {
    console.error("Error fetching country codes:", error);
  }
}

async function get_user_location() {
  let defaultToFirstCountry = false;

  if (navigator.geolocation) {
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      const coords = [latitude, longitude];

      map.spin(true);

      const response = await fetch(
        `php/getCountryCodeFromLatLng.php?lat=${latitude}&lng=${longitude}`
      );
      const json = await response.json();

      map.spin(false);

      const country_code = json.countryCode;
      $("#country_list").val(country_code).trigger("change", [true]); // Pass true as the second argument to the event handler
      get_country_border(country_code);
    } catch (error) {
      defaultToFirstCountry = true;
    }
  } else {
    defaultToFirstCountry = true;
  }

  if (defaultToFirstCountry) {
    const firstCountryOption = $("#country_list option:first");
    const firstCountryCode = firstCountryOption.val();
    firstCountryOption.prop("selected", true);
    get_country_border(firstCountryCode);
  }
}
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

let cities_cluster = null;
async function get_country_border(country_code) {
  try {
    const response = await $.ajax({
      url: "php/getCountryBorder.php",
      type: "GET",
      data: {
        country_code: country_code
      },
    });
    const json = JSON.parse(response);
    country_boundary.clearLayers();
    country_boundary.addData(json).setStyle(polystyle());
    const bounds = country_boundary.getBounds();
    map.fitBounds(bounds);
    const east = bounds.getEast();
    const west = bounds.getWest();
    const north = bounds.getNorth();
    const south = bounds.getSouth();

    // Clear previous markers
    if (cities_fg) {
      cities_fg.clearLayers();
    }

    await Promise.all([
      get_nearby_cities(east, west, north, south, country_code),
      get_nearby_wikipedia(east, west, north, south, country_code),
    ]);
    // Add marker cluster group to map
    if (cities_cluster) {
      map.removeLayer(cities_cluster);
    }
    if (cities_fg) {
      if (!cities_cluster) {
        cities_cluster = L.markerClusterGroup();
      }
      cities_cluster.clearLayers();
      cities_cluster.addLayer(cities_fg);
      map.addLayer(cities_cluster);
    }

  } catch (error) {
    console.error(error);
  }
}

const cityMarkers = L.layerGroup();

const cityMarkerButton = L.easyButton({
  states: [{
    stateName: 'toggleCityMarkers',
    icon: 'fas fa-city ft-eb center-align',
    title: 'Toggle city markers',
    onClick: function(btn, map) {
      if (map.hasLayer(cityMarkers)) {
        map.removeLayer(cityMarkers);
        btn.state('hideCityMarkers');
      } else {
        map.addLayer(cityMarkers);
        btn.state('showCityMarkers');
      }
    }
  }]
});

//cityMarkerButton.addTo(map);

async function get_nearby_cities(east, west, north, south, country_code) {
  try {
    // Show spinner
    map.spin(true);
    // Clear any existing layers in the cities feature group
    cities_fg.clearLayers();
    // Make an AJAX call to the server to retrieve the nearby cities
    const response = await $.ajax({
      url: "php/getNearByCities.php",
      type: "GET",
      data: {
        east: east,
        west: west,
        north: north,
        south: south,
        username: "username",
        country_code: country_code // add country code parameter to the AJAX call
      },
    });
    // Parse the JSON string to a JavaScript object
    const data = JSON.parse(response).geonames;
    // Filter the city data based on the country code
    const filteredData = data.filter(city => city.countrycode === country_code);
    // Create an icon for the city markers
    const city_icon = L.ExtraMarkers.icon({
      icon: "fa-city",
      markerColor: "yellow",
      shape: "circle",
      prefix: "fa",
    });
    // Create a MarkerClusterGroup object for the city markers
    const city_markers = L.markerClusterGroup();
    // Loop through the filtered city data and add markers to the marker cluster group
    filteredData.forEach((city) => {
      const marker = L.marker([city.lat, city.lng], {
        icon: city_icon,
      }).bindPopup(
        "<b>" +
        city.name +
        "</b><br>Population: " +
        parseInt(city.population).toLocaleString("en")
      );
      city_markers.addLayer(marker);
    });
    // Add the marker cluster group to the cityMarkers layer group
    cityMarkers.clearLayers().addLayer(city_markers);
    // Hide spinner
    map.spin(false);
  } catch (error) {
    // Hide spinner in case of an error
    map.spin(false);
    console.error(error);
  }
}

function preloadImages(urls, allImagesLoadedCallback){
    var loadedCounter = 0;
    var toBeLoadedNumber = urls.length;
    urls.forEach(function(url){
      if (url !== undefined) {
          preloadImage(url, function(){
              loadedCounter++;
              console.log('Number of loaded images: ' + loadedCounter);
              if(loadedCounter == toBeLoadedNumber){
                  allImagesLoadedCallback();
              }
          });
      }
  });
    function preloadImage(url, anImageLoadedCallback){
        var img = new Image();
        img.onload = anImageLoadedCallback;
        img.src = url;
    }
}

    // Define wikipedia markers layer group outside the function
const wikipedia_markers = L.markerClusterGroup();

// Add a variable to track the visibility of the Wikipedia markers
let wikipediaVisible = false;

// Create an EasyButton for the Wikipedia markers
const wikipediaButton = L.easyButton({
  states: [
    {
      stateName: 'showWikipediaMarkers',
      icon: 'fab fa-wikipedia-w',
      title: 'Show Wikipedia markers',
      onClick: function (control) {
        map.addLayer(wikipedia_markers);
        wikipediaVisible = true;
        control.state('hideWikipediaMarkers');
      },
    },
    {
      stateName: 'hideWikipediaMarkers',
      icon: 'fab fa-wikipedia-w',
      title: 'Hide Wikipedia markers',
      onClick: function (control) {
        map.removeLayer(wikipedia_markers);
        wikipediaVisible = false;
        control.state('showWikipediaMarkers');
      },
    },
  ],
});

// Add the Wikipedia EasyButton to the map
//wikipediaButton.addTo(map);

async function get_nearby_wikipedia(east, west, north, south, country_code) {
  try {
    // Show spinner
    map.spin(true);
    // Clear any existing Wikipedia markers from the map
    wikipedia_fg.clearLayers();
    wikipedia_markers.clearLayers();

    // Send an AJAX GET request to the specified PHP script
    const response = await fetch(`php/getNearByWikipedia.php?east=${east}&west=${west}&north=${north}&south=${south}&country_code=${country_code}`);
    const json = await response.json();

    // Get the array of Wikipedia articles from the data
    const data = json.geonames;

    // Filter the data to only include articles from the selected country
    const filteredData = data.filter(item => item.countryCode === country_code);

    // Create a custom icon for the Wikipedia markers
    const wiki_icon = L.ExtraMarkers.icon({
      icon: "fa-wikipedia-w",
      markerColor: "blue",
      shape: "square",
      prefix: "fab"
    });

    // Create an array to hold the URLs of all the wiki link images
    const imageUrls = [];

    // Loop through each Wikipedia article in the filtered data array
    filteredData.forEach((item) => {
      // Add the URL of the current article's image to the imageUrls array
      imageUrls.push(item.thumbnailImg);

      // Create a marker for the current article
      const marker = L.marker([item.lat, item.lng], {
        icon: wiki_icon,
      }).bindPopup(
        `<img src='${item.thumbnailImg}' width='100px' height='100px' alt='${item.title}' onerror="this.onerror=null; this.src='css/images/WikiFront.png'"><br><b>${item.title}</b><br><a href='https://${item.wikipediaUrl}' target='_blank'>Wikipedia Link</a>`
      );

      // Add the marker to the Wikipedia markers layer group
      wikipedia_markers.addLayer(marker);
    });

    // Hide spinner
    map.spin(false);

    // Call the preloadImages function with the imageUrls array
    preloadImages(imageUrls, function() {
      console.log("All images were loaded");
    });

  } catch (error) {
    // Hide spinner in case of an error
    map.spin(false);
    console.error(error);
  }
}

function polystyle() {
  return {
    fillColor: "blue",
    weight: 1,
    opacity: 0.5,
    color: "red", //Outline color
    fillOpacity: 0.1,
  };
}

function zoomToCountry(country_code) {
  if (country_code == "") return;
  country_name = $("#country_list option:selected").text();
  country_code_global = country_code;
  get_country_border(country_code);
  hideCountryInfo();
}

// Add an event listener to the country_list select element
$("#country_list").on("change", function() {
  const country_code = $(this).val(); // Get the selected country code
  if (country_code) {
    get_country_info(country_code); // Call the get_country_info function with the selected country code
    hideCountryInfo(); // hide the country info box when a new country is selected
  }
});

const countryButton = L.easyButton({
  states: [{
    stateName: 'show-country-info',
    icon: 'fa-globe ft-eb center-align',
    title: 'Country Information',
    onClick: showCountryInfo
  }]
});

countryButton.addTo(map);

function showCountryInfo() {
  const country_code = $("#country_list").val();
  get_country_info(country_code);
  showCountryInfoBox(); // show the country info box when the button is pressed
}

function showCountryInfoBox() {
  // Show the country info modal
  $("#country_info_modal").modal("show");

    $("#country_info_modal .modal-dialog").addClass("modal-dialog-centered");
    $("#country_info_modal .modal-dialog").css({
    });
}

function hideCountryInfo() {
  // Hide the country info popup 
  $("#country_info").css({
    opacity: "0",
    top: "-500px"
  });
  $(".pull_country_info_popup").css({
    left: "-30px"
  });
}

async function get_country_info(country_code) {
  try {
    // Send a GET request to the server to retrieve country information
    const response = await $.ajax({
      url: "php/getCountryInfo.php",
      type: "GET",
      data: {
        country_code: country_code
      },
    });

    // Parse the JSON response from the server
    const details = $.parseJSON(response);

    // Update the country information in the modal
    lat = details.latlng[0];
    lng = details.latlng[1];
    $("#country_capital").html(details.capital);
    $("#country_population").html(numeral(details.population).format('0,0'));
    $("#country_flag").attr("src", details.flag);
    $("#country_currency").html(details.currencies[0]["name"]);
    $("#country_wikipedia").attr("href", "https://en.wikipedia.org/wiki/" + details.name);
    

} catch (error) {
// Log any errors that occur while retrieving the country information
console.error(error);
}
}


const covidButton = L.easyButton({
  states: [{
    stateName: 'getCovidData',
    icon: 'fa-virus-covid ft-eb center-align',
    title: 'Get Covid data',
    onClick: get_covid_data
  }]
});

covidButton.addTo(map);

async function get_covid_data() {
  map.spin(true);
  const countryName = $("#country_list option:selected").text();
  try {
    const response = await $.ajax({
      url: "php/getCovidInfo.php",
      type: "GET",
      dataType: "json",
      data: {
        countryName
      },
    });

    const details = response.response;
    details.forEach((covidData) => {
      const numeralTotalCases = numeral(covidData.cases.total);
      const numeralActiveCases = numeral(covidData.cases.active);

      $("#covid_total_cases").html(numeralTotalCases.format('0,0').toLocaleString());
      $("#covid_active").html(numeralActiveCases.format('0,0').toLocaleString());
      $("#covid_recovered").html(parseInt(covidData.cases.recovered).toLocaleString());
      $("#covid_deaths").html(parseInt(covidData.deaths.total).toLocaleString());
      // Check if covidData.cases.new is null and display '0' if it is, otherwise display the value
      const newCases = covidData.cases.new === null ? '0' : parseInt(covidData.cases.new).toLocaleString();
      $("#covid_todayCases").html(newCases);
    });
    
    $("#covidModal").modal("show");
  } catch (error) {
    console.log(error);
  } finally {
    map.spin(false);
  }
}
const weatherButton = L.easyButton({
  states: [{
    stateName: 'getWeatherData',
    icon: 'fas fa-cloud-sun ft-eb center-align',
    title: 'Get weather data',
    onClick: get_weather_data
  }]
});

async function getLocationInfo(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    const countryCode = data.address.country_code.toUpperCase();
    const countryName = data.address.country;
    const capitalResponse = await fetch(
      `https://restcountries.com/v3.1/alpha/${countryCode}`
    );
    const capitalData = await capitalResponse.json();
    const capital = capitalData[0].capital[0];
    return {
      city: capital,
      country: countryName
    };
  } catch (error) {
    console.error("Error fetching location info:", error);
  }
}

weatherButton.addTo(map);

async function get_weather_data() {
  map.spin(true);
  try {
    // Get the current location of the map center
    const center = map.getCenter();
    const lat = center.lat.toFixed(4);
    const lng = center.lng.toFixed(4);

    const response = await $.ajax({
      url: "php/getWeatherInfo.php",
      type: "GET",
      data: {
        lat: lat,
        lng: lng
      },
    });
    let details = $.parseJSON(response);
    console.log(details);

    // Fetch country and city name
    const locationInfo = await getLocationInfo(lat, lng);

    $("#first_row").html("");
    $("#second_row").html("");
    $("#third_row").html("");
    for (let i = 0; i < 5; i++) {
      const d = details["daily"][i];
      const date = new Date(d["dt"] * 1000);
      const formattedDate = date.toLocaleDateString("en-GB", {
        month: "short",
        day: "numeric",
      });
      const maxTemp = parseInt(numeral(d["temp"]["max"]).format("0")).toLocaleString();
      const minTemp = parseInt(numeral(d["temp"]["min"]).format("0")).toLocaleString();
      $("#first_row").append("<td>" + formattedDate + "</td>");
      $("#second_row").append("<td>" + maxTemp + "°</td>");
      $("#third_row").append("<td>" + minTemp + "°</td>");
    }
    // Update weather data display
    $("#weather_city_name").html(`${locationInfo.city}, ${locationInfo.country}`);

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
  } catch (error) {
    console.error(error);
  }
}
const newsButton = L.easyButton({
  states: [{
    stateName: 'getNewsData',
    icon: 'fas fa-newspaper ft-eb center-align',
    title: 'Get News',
    onClick: get_news_data
  }]
});

newsButton.addTo(map);

async function get_news_data() {
  var countryCode = $("#country_list").val();
  $("#news_data").html("");
  map.spin(true);
  try {
    let response = await $.ajax({
      url: "php/getNewsInfo.php",
      data: {
        countryCode: countryCode
      },
      method: "GET",
    });
    response = JSON.parse(response);
    console.log(response);
    if (response.articles && response.articles.length > 0) {
      const data = response.articles;
      for (let i = 0; i < data.length; i++) {
        const newsCard = get_news_card(data[i]);
        document.querySelector("#news_data").appendChild(newsCard);
      }
    } else {
      $("#news_data").html("<p>No news found for this country.</p>");
    }
    map.spin(false);
    $("#newsModal").modal();
  } catch (error) {
    console.error(error);
  }
}

function get_news_card(data) {
  const template = document.getElementById('news-card-template');
  const card = template.content.cloneNode(true);

  card.querySelector('.card-title').textContent = data.author;
  card.querySelector('.card-text').textContent = data.title;

  if (data.urlToImage !== null) {
    const img = document.createElement('img');
    img.src = data.urlToImage;
    img.alt = 'News Image';
    img.classList.add('card-img-top');
    card.querySelector('.card-image').appendChild(img);
  } else {
    card.querySelector('.card-image').textContent = 'Image not available';
  }

  if (data.description !== null) {
    card.querySelector('.card-description').textContent = data.description;
  }

  card.querySelector('.btn-primary').href = data.url;

  return card;
}

const holidayButton = L.easyButton({
  states: [{
    stateName: 'getnationalholidayData',
    icon: 'fa fa-umbrella-beach ft-eb center-align',
    title: 'Get national holiday data',
    onClick: get_nationalHolidays_data
  }]
});

holidayButton.addTo(map);

function get_nationalHolidays_data() {
  const countrycode = $("#country_list").val();
  nationalHolidays(countrycode);
}

async function nationalHolidays(countrycode) {
  try {
    const result = await $.ajax({
      url: "php/getNationalHolidays.php",
      type: 'GET',
      dataType: 'json',
      data: {
        countrycode,
      },
    });
    $('#nationalHoliday').html(result[0].localName);
    $('#tableContainer').empty();
    for (var i = 1; i < result.length; i++) {
      const formattedDate = new Intl.DateTimeFormat('en-GB').format(new Date(result[i].date));
      $('#tableContainer').append('<tr><td>' + result[i].localName + '</td><td>' + formattedDate + '</td></tr>');
    }
    $('#holidayModal').modal('show');
  } catch (error) {
    console.log(error);
  }
}

// Define the Wikipedia layer group
const wikipediaLayer = L.layerGroup([wikipedia_markers]);

// Define the city markers layer group
const cityLayer = L.layerGroup([cityMarkers]);

// Add the tile layers for streets and satellite views
const streets = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
});

const satellite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  }
);

// Add these layers to the map and set the streets as the default layer
const baseLayers = {
  Streets: streets,
  Satellite: satellite,
};

L.control.layers(baseLayers, { 'Wikipedia Markers': wikipediaLayer, 'City Markers': cityLayer }).addTo(map);
streets.addTo(map);

// Add the city markers and Wikipedia markers to the map by default
map.addLayer(cityLayer);
map.addLayer(wikipediaLayer);
