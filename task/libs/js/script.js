$('#countryBtn').click(function () {
  var inputValue = $('#inputCountry').val();
  $('#results-table-body').empty(); // Clear the table before appending new data
  $('#results-table thead tr:nth-child(1) th:nth-child(2)').text('Continent');
  $('#results-table thead tr:nth-child(1) th:nth-child(3)').text('Capital');
  $('#results-table thead tr:nth-child(1) th:nth-child(4)').text('Languages');
  $('#results-table thead tr:nth-child(1) th:nth-child(5)').text('Country Name');
  $('#results-table thead tr:nth-child(1) th:nth-child(6)').text('Currency Code');
  $('#results-table thead tr:nth-child(1) th:nth-child(7)').text('Area in Sq Km');
  $('#results-table thead tr:nth-child(1) th:nth-child(8)').text('Population');
  $('#results-table thead').show();
  $.ajax({
    url: 'libs/php/countryInfoAPI.php',
    type: 'GET',
    data: {
      countryName: inputValue
    },
    dataType: 'json',
    success: function (result) {
      if(result.length>0){
        $.each(result, function (i, item) {
          var row = $('<tr>');
          var apiNameCell = $('<td>').text('Geonames Country Info');
          var continentCell = $('<td>').text(item.continentName);
          var capitalCell = $('<td>').text(item.capital);
          var languagesCell = $('<td>').text(item.languages);
          var countryNameCell = $('<td>').text(item.countryName);
          var currencyCodeCell = $('<td>').text(item.currencyCode);
          var areaInSqKmCell = $('<td>').text(item.areaInSqKm);
          var populationCell = $('<td>').text(item.population);
          row.append(apiNameCell, continentCell, capitalCell, languagesCell, countryNameCell, currencyCodeCell, areaInSqKmCell, populationCell);
          $('#results-table-body').append(row);
        });
      }else {
      // Show an error message if no country is found
      var row = $('<tr>');
      var errorCell = $('<td>').text('No country found with that name');
      row.append(errorCell);
      $('#results-table-body').append(row);
      }
      }
      });
      });

$('#weatherBtn').click(function () {
$('#results-table-body').empty(); // Clear the table before appending new data
var inputValue = $('#inputWeather').val();
$('#results-table thead tr:nth-child(1) th:nth-child(2)').text('Language');
$('#results-table thead tr:nth-child(1) th:nth-child(3)').text('Observation');
$('#results-table thead').show();
$.ajax({
url: 'libs/php/weatherAPI.php',
type: 'GET',
data: {
location: inputValue
},
dataType: 'json',
success: function (result) {
$.each(result.weatherObservations, function (i, item) {
var row = $('<tr>');
var apiNameCell = $('<td>').text('Geonames Weather');
var languageCell = $('<td>').text(item.lng);
var observationCell = $('<td>').text(item.observation);
row.append(apiNameCell, languageCell, observationCell);
$('#results-table-body').append(row);
});
}
});
});

$('#wikiForm').on('submit', function(e) {
  e.preventDefault();
  $('#results-table-body').empty(); // Clear the table before appending new data
  var inputValue = $('#searchTerm').val();
  $('#results-table thead tr:nth-child(1) th:nth-child(2)').text('Title');
  $('#results-table thead tr:nth-child(1) th:nth-child(3)').text('Summary');
  $('#results-table thead tr:nth-child(1) th:nth-child(4)').text('Country Code');
  $('#results-table thead tr:nth-child(1) th:nth-child(5)').text('Wikipedia URL');
  $('#results-table thead').show();
  $.ajax({
    url: 'libs/php/wikipediaAPI.php',
    type: 'GET',
    data: {
      searchTerm: inputValue
    },
    dataType: 'json',
    success: function (result) {
      $.each(result.geonames, function (i, item) {
        var row = $('<tr>');
        var apiNameCell = $('<td>').text('Wikipedia');
        var titleCell = $('<td>').text(item.title);
        var summaryCell = $('<td>').text(item.summary);
        var countryCodeCell = $('<td>').text(item.countryCode);
        var wikipediaUrlCell = $('<td>').text(item.wikipediaUrl);
        row.append(apiNameCell, titleCell, summaryCell, countryCodeCell, wikipediaUrlCell);
        $('#results-table-body').append(row);
      });
    }
  });
});
