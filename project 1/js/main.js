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

  async function get_user_location() {
    if (navigator.geolocation) {
    try {
    const position = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];
  
    map.spin(true);
  
    const response = await fetch(
      `php/getCountryCodeFromLatLng.php?lat=${latitude}&lng=${longitude}&username=billthomson1989`
    );
    const json = await response.json();
  
    map.spin(false);
  
    const country_code = json.countryCode;
    $("#country_list").val(country_code).trigger("change");
  } catch (error) {
    alert("Could not get your position!");
  }
  
  }
  }

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
    await Promise.all([
    get_nearby_cities(east, west, north, south),
    get_nearby_wikipedia(east, west, north, south),
    ]);
    } catch (error) {
    console.error(error);
    }
    }

    async function get_nearby_cities(east, west, north, south) {
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
          username: "billthomson1989",
        },
      });
      // Parse the JSON string to a JavaScript object
      const data = JSON.parse(response).geonames;
      // Create an icon for the city markers
      const city_icon = L.ExtraMarkers.icon({
        icon: "fa-city",
        markerColor: "yellow",
        shape: "circle",
        prefix: "fa",
      });
      // Loop through the city data and add markers to the cities feature group
      data.forEach((city) => {
        const marker = L.marker([city.lat, city.lng], {
          icon: city_icon,
        }).bindPopup(
          "<b>" +
          city.name +
          "</b><br>Population: " +
          parseInt(city.population).toLocaleString("en")
        );
        cities_fg.addLayer(marker);
      });
    }

// Function to get nearby Wikipedia articles based on the provided coordinates
async function get_nearby_wikipedia(east, west, north, south) {
  try {
  // Clear any existing Wikipedia markers from the map
  wikipedia_fg.clearLayers();

  // Send an AJAX GET request to the specified PHP script
  const response = await fetch(`php/getNearByWikipedia.php?east=${east}&west=${west}&north=${north}&south=${south}&username=billthomson1989`);
  const json = await response.json();
  
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
  
  // Loop through each Wikipedia article in the data array using the forEach method
  data.forEach((item) => {
    // Create a marker for the current article
    const marker = L.marker([item.lat, item.lng], {
      icon: wiki_icon, // Use the custom icon
    }).bindPopup(
      // The content of the popup for the marker
      `<img src='${item.thumbnailImg}' width='100px' height='100px' alt='${item.title}'><br><b>${item.title}</b><br><a href='https://${item.wikipediaUrl}' target='_blank'>Wikipedia Link</a>`
    );
    // Add the marker to the Wikipedia markers layer group
    wikipedia_fg.addLayer(marker);
  });
  
  } catch (error) {
  console.error(error);
  }
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

// Function to retrieve country information and display it
async function get_country_info(country_code) {
  // Animate the country info popup to slide into view
  if ($("#country_info").css("left") !== "5px") {
    $("#country_info").animate({
      left: "5px"
    }, 1000);
    $(".pull_country_info_popup").animate({
      left: "-40px"
    }, 1000);
  }
  
  // Show the loading spinner on the map
  map.spin(true, {
    top: 180,
    left: 150
  });

  try {
    // Send a GET request to the server to retrieve country information
    const response = await $.ajax({
      url: "php/getCountryInfo.php",
      type: "GET",
      data: {
        country_code: country_code
      },
    });

    // Hide the loading spinner on the map
    map.spin(false);

    // Parse the JSON response from the server
    const details = $.parseJSON(response);
    console.log(details);

    // Update the country information on the page
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
  } catch (error) {
    // Log any errors that occur while retrieving the country information
    console.error(error);
  }
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


async function get_covid_data() {
  map.spin(true);
  let countryName = $("#country_list option:selected").text(); //get the selected country name from the dropdown
  const response = await $.ajax({
    url: "php/getCovidInfo.php",
    type: "GET",
    dataType: "json",
    data: {
      countryName: countryName
    },
  });

  const details = response.response;
  details.forEach((covidData) => {
    $("#covid_total_cases").html(covidData.cases.total);
    $("#covid_active").html(covidData.cases.active);
    $("#covid_recovered").html(covidData.cases.recovered);
    $("#covid_deaths").html(covidData.deaths.total);
    $("#covid_todayCases").html(covidData.cases.new);
  });

  map.spin(false);
  $("#coronoModal").modal();
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
  var countryCode = $("#country_list").val();
  $("#news_data").html("");
  map.spin(true);
  $.ajax({
    url: "php/getNewsInfo.php",
    data: {
      countryCode: countryCode
    },
    method: "GET",
    success: function (response) {
      response = JSON.parse(response);
      console.log(response);
      if (response.articles && response.articles.length > 0) {
        const data = response.articles;
        for (let i = 0; i < data.length; i++) {
          $("#news_data").append(get_news_card(data[i]));
        }
      } else {
        $("#news_data").html("<p>No news found for this country.</p>");
      }
      map.spin(false);
      $("#newsModal").modal();
    },
  });
}

function get_news_card(data) {
  let card = '<div class="card" style="width: 20rem;"> <div class="card-body"> <h5 class="card-title">' +
    data["author"] +
    '</h5> <p class="card-text">' +
    data["title"] +
    '</p>';

  if (data["urlToImage"] !== null) {
    card += '<img class="card-img-top" src="' + data["urlToImage"] + '" alt="News Image">';
  } else {
    card += '<p>Image not available</p>';
  }
  
  if (data["description"] !== null) {
    card += '<p>' + data["description"] + '</p>';
  }

  card += '<a href="' +
    data["url"] +
    '" target="_blank" class="btn btn-primary">Details</a> </div> </div>';

  return card;
}