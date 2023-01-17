$('#wikiBtn')
.click(function () {

$.ajax({
  url: 'libs/php/wikipediaAPI.php',
  type: 'GET',
  dataType: 'json',
  success: function (result) {
    $('#wikipedia-results-table').html('');
    
    $.each(result.query.search, function (i, item) {
          $('#wikipedia-results-table').append(`<tr><td>${item.title}</td><td>${item.snippet}</td><td>N/A</td><td>https://en.wikipedia.org/wiki/${item.title}</td></tr>`)
    });
  }
})

})

$('#weatherBtn').click(function () {

$.ajax({
url: 'libs/php/weatherAPI.php',
type: 'GET',
dataType: 'json',
success: function (result) {
$('#geonames-weather-results-table').html('')

  $.each(result, function (i, item) {
  
    $
      .each(item, function (index, val) {
      
        $('#geonames-weather-results-table').append(`<tr><td>${val.lng}</td><td>${val.observation}</td></tr>`)
      })
  })
}

})
});

$('#countryBtn').click(function () {

$.ajax({
url: 'libs/php/countryInfoAPI.php',
type: 'GET',
dataType: 'json',
success: function (result) {
$('#geonames-country-info-results-table').html('')

  $.each(result, function (i, item) {
  
    $
      .each(item, function (index, val) {
      
        $('#geonames-country-info-results-table').append(`<tr><td>${val.continent}</td><td>${val.capital}</td><td>${val.languages}</td><td>${val.countryName}</td><td>${val.currencyCode}</td></tr>`);
      });
    });
  }
});
});
