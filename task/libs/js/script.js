$('#wikiBtn').click(function () {
  $('#results-table-body').empty(); // Clear the table before appending new data
  $('#results-table thead tr:nth-child(1) th:nth-child(2)').text('Title');
  $('#results-table thead tr:nth-child(1) th:nth-child(3)').text('Summary');
  $('#results-table thead tr:nth-child(1) th:nth-child(4)').text('Country Code');
  $('#results-table thead tr:nth-child(1) th:nth-child(5)').text('Wikipedia URL');
  $('#results-table thead').show();
  $.ajax({
    url: 'libs/php/wikipediaAPI.php',
    type: 'GET',
    dataType: 'json',
    success: function (result) {
      $.each(result.geonames, function (i, item) {
        $('#results-table-body').append(`<tr><td>Wikipedia</td><td>${item.title}</td><td>${item.summary}</td><td>${item.countryCode}</td><td>${item.wikipediaUrl}</td></tr>`)
      });
    }
  });
});

  $('#weatherBtn').click(function () {
    $('#results-table-body').empty(); // Clear the table before appending new data
    $('#results-table thead tr:nth-child(1) th:nth-child(2)').text('Language');
    $('#results-table thead tr:nth-child(1) th:nth-child(3)').text('Observation');
    $('#results-table thead').show();
    $.ajax({
      url: 'libs/php/weatherAPI.php',
      type: 'GET',
      dataType: 'json',
      success: function (result) {
        $.each(result.weatherObservations, function (i, item) {
          $('#results-table-body').append(`<tr><td>Geonames Weather</td><td>${item.lng}</td><td>${item.observation}</td></tr>`)
        });
      }
    });
  });

  $('#countryBtn').click(function () {
    $.ajax({
      url: 'libs/php/countryInfoAPI.php',
      type: 'GET',
      dataType: 'json',
      success: function (result) {
        $('#results-table-body').html('');
        $('#results-table thead tr:nth-child(1) th:nth-child(2)').text('Continent');
        $('#results-table thead tr:nth-child(1) th:nth-child(3)').text('Capital');
        $('#results-table thead tr:nth-child(1) th:nth-child(4)').text('Languages');
        $('#results-table thead tr:nth-child(1) th:nth-child(5)').text('Country Name');
        $('#results-table thead tr:nth-child(1) th:nth-child(6)').text('Currency Code');
        $('#results-table thead tr:nth-child(1) th:nth-child(7)').text('Area in Sq Km');
        $('#results-table thead tr:nth-child(1) th:nth-child(8)').text('Population');
        $('#results-table thead').show();
        $.each(result.geonames, function (i, item) {
          $('#results-table-body').append(`<tr>
          <td>Geonames Country Info</td>
          <td>${item.continentName}</td>
          <td>${item.capital}</td>
          <td>${item.languages}</td>
          <td>${item.countryName}</td>
          <td>${item.currencyCode}</td>
          <td>${item.areaInSqKm}</td>
          <td>${item.population}</td>
          </tr>`);
        });
      }
    });
  });
