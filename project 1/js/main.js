// Variables to store the various layers on the map
let country_boundary;
let map;
let wikipedia_fg;
let cities_fg;
let country_code_global = "";
let country_name;
let lat;
let lng;

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

// Function to fetch the country codes from a PHP file and populate a select list
function get_country_codes() {
  $.ajax({
    url: "php/getCountriesCode.php?",
    type: "GET",
    success: function (json) {
      let countries = JSON.parse(json);
      let option = "";
      for (country of countries) {
        option += '<option value="' + country.iso + '">' + country.name + "</option>";
      }
      $("#country_list").append(option).select2();
      // Attach an event listener to the select element
      $("#country_list").change(function() {
        const country_code = $(this).val();
        get_country_border(country_code);
      });
    },
  });
}

async function get_user_location() {
  let defaultToFirstCountry = false;

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
      get_nearby_cities(east, west, north, south),
      get_nearby_wikipedia(east, west, north, south),
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
      // Create a MarkerClusterGroup object for the city markers
      const city_markers = L.markerClusterGroup();
      // Loop through the city data and add markers to the marker cluster group
      data.forEach((city) => {
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
      // Add the marker cluster group to the cities feature group
      cities_fg.addLayer(city_markers);
    }

    // Define wikipedia markers layer group outside the function
const wikipedia_markers = L.markerClusterGroup();


async function get_nearby_wikipedia(east, west, north, south) {
  try {
    // Clear any existing Wikipedia markers from the map
    wikipedia_fg.clearLayers();
    wikipedia_markers.clearLayers();

    // Send an AJAX GET request to the specified PHP script
    const response = await fetch(`php/getNearByWikipedia.php?east=${east}&west=${west}&north=${north}&south=${south}&username=billthomson1989`);
    const json = await response.json();

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
    data.forEach((item) => {
      // Create a marker for the current article
      const marker = L.marker([item.lat, item.lng], {
        icon: wiki_icon,
      }).bindPopup(
        `<img src='${item.thumbnailImg}' width='100px' height='100px' alt='${item.title}'><br><b>${item.title}</b><br><a href='https://${item.wikipediaUrl}' target='_blank'>Wikipedia Link</a>`
      );

      // Add the marker to the Wikipedia markers layer group
      wikipedia_markers.addLayer(marker);
    });

    // Add the Wikipedia markers cluster group to the map
    map.addLayer(wikipedia_markers);

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
      "top": "20px",
      "left": "80px",
      "margin": "0",
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
      $("#covid_todayCases").html(parseInt(covidData.cases.new).toLocaleString());
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

weatherButton.addTo(map);

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
        const maxTemp = parseInt(numeral(d["temp"]["max"]).format("0")).toLocaleString();
        const minTemp = parseInt(numeral(d["temp"]["min"]).format("0")).toLocaleString();
        $("#first_row").append("<td>" + day + "</td>");
        $("#second_row").append("<td>" + maxTemp + "°</td>");
        $("#third_row").append("<td>" + minTemp + "°</td>");
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

const newsButton = L.easyButton({
  states: [{
    stateName: 'getNewsData',
    icon: 'fas fa-newspaper ft-eb center-align',
    title: 'Get News',
    onClick: get_news_data
  }]
});

newsButton.addTo(map);

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

function nationalHolidays(countrycode) {
  $.ajax({
    url: "php/getNationalHolidays.php",
    type: 'GET',
    dataType: 'json',
    data: {
      countrycode,
    },
    success: function(result) {
      $('#nationalHoliday').html(result[0].localName);
      $('#tableContainer').empty();
      for (var i = 1; i < result.length; i++) {
        const formattedDate = new Intl.DateTimeFormat('en-GB').format(new Date(result[i].date));
        $('#tableContainer').append('<tr><td>' + result[i].localName + '</td><td>' + formattedDate + '</td></tr>');
      }
      $('#holidayModal').modal('show');
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(errorThrown);
    }
  });
}