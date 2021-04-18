//https://covid19api.com/

//Document Ready
//Search for countries' list
//Export an array of country names; 
//Create a list for easy selection using the country array
//Submit form, prevent default
//Show error message if the field is empty
//Clear old values and error messagees
//Find country SLUG for the selected country
//Show error message if the country doesn't exist
//Import all necessary data into arrays for the selected country
//Append data to HTML file
//Calculate previous day's data and new Cases Confirmed, Recovered, Deaths
//Calculate daily new cases
//Create a chart of daily new cases
//Create a chart of daily cases
//Get data about each province
//In case provinces are entered more than once daily, calculate Total amounts
//Sort provinces by name for display
//Append data about each province to the HTML
//If clicked on the province, show newest data (since previous day's midnight)


const app = {};

const $errorMessage = $('.errorMessages');
const $appendData = $('.data');
const $dataProvinces = $('.detailsProvinces');
const $inputText = $('input[type=text]');
const $formSubmit = $('form');

let countryName = '';
let countryEntered = '';
let slug = '';
let countries = [];

let casesConfirmedY = [];
let dateConfirmedX = [];
let casesRecoveredY = [];
let casesDeathsY = [];
let casesActiveY = [];
let newConfirmed = [];

//Append province names and data to HTML file
app.appendProvinceData = function (resultCasesByProvince) {
  for (let i = 0; i < $(resultCasesByProvince).length; i++) {
    if (resultCasesByProvince[i].Province !== "") {
      $dataProvinces.append(`
        <div class = "byProvince">
          <h4>${resultCasesByProvince[i].Province}</h4>
          <div class = "byProvinceCases hide">
            <h5>Active Cases</h5><p>${resultCasesByProvince[i].Active}</p>
            <h5>Confirmed Cases</h5><p>${resultCasesByProvince[i].Confirmed}</p>
            <h5>Deaths</h5><p>${resultCasesByProvince[i].Deaths}</p>
          </div>
        </div>`
      );
    };
    //On Click show data about each province
    $('.byProvince').unbind("click").on('click', function () {
      $(this).find('.byProvinceCases').toggleClass('show', 'hide');
    });
  };
};

//Function for contries which have provinces
app.countriesProvincesConfirmed = function (countrySlug) {
  let d = new Date();
  let day = ("0" + d.getDate()).slice(-2);
  let prevDay = ("0" + (d.getDate() - 1)).slice(-2);
  let month = ("0" + (d.getMonth() + 1)).slice(-2);
  let year = (d.getUTCFullYear());
  let toDate = (year + "-" + month + "-" + day + "T00:00:00Z");
  let fromDate = (year + "-" + month + "-" + (prevDay) + "T00:00:00Z");
  $.ajax({
    url: `https://api.covid19api.com/country/${slug}?from=${fromDate}&to=${toDate}`,
    method: "GET",
    timeout: 0
  }).then(function (response2) {
    //If the province is entered more than once, show SUM of all amounts 
    let provinceActiveCases = {};
    let resultCasesByProvince = response2.reduce(function (r, o) {
      let key = o.Province;
      if (!provinceActiveCases[key]) {
        provinceActiveCases[key] = Object.assign({}, o); // create a copy of o
        r.push(provinceActiveCases[key]);
      }
      else {
        provinceActiveCases[key].Active += o.Active;
        provinceActiveCases[key].Confirmed += o.Confirmed;
        provinceActiveCases[key].Deaths += o.Deaths;
        provinceActiveCases[key].Recovered += o.Recovered;
      }
      return r;
    }, []);
    //Sort provinces by name
    resultCasesByProvince.sort(function (a, b) {
      let nameA = a.Province.toLowerCase(), nameB = b.Province.toLowerCase()
      if (nameA < nameB) //sort string ascending
        return -1
      if (nameA > nameB)
        return 1
      return 0 //default return value (no sorting)
    });
    app.appendProvinceData(resultCasesByProvince);
  });
};


// Charts.js query for Active, Recovered, Confirmed, Deaths Cases
app.chartIt = function () {
  const ctx = document.getElementById('myChart').getContext('2d');
  if (window.line != undefined)
    window.line.destroy()
  window.line = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dateConfirmedX,
      datasets: [{
        label: '# of Confirmed Cases',
        data: casesConfirmedY,
        fill: false,
        borderColor:
          '#8d8568',
        borderWidth: 3,
        order: 1
      },
      {
        label: '# of Recovered Cases',
        data: casesRecoveredY,
        fill: false,
        borderColor:
          '#f8f7fc',
        borderWidth: 3,
        order: 2
      },
      {
        label: '# of Deaths Cases',
        data: casesDeathsY,
        fill: false,
        borderColor:
          '#762d19',
        borderWidth: 3,
        order: 3
      },
      {
        label: '# of Active Cases',
        data: casesActiveY,
        fill: false,
        borderColor:
          '#ca4d2b',
        borderWidth: 3,
        order: 4
      }
      ],
    },
    options: {
      tooltips: {
        titleFontSize: 16,
        bodyFontSize: 16
      },
      responsive: false,
      maintainAspectRatio: true,
      legend: {
        labels: {
          fontSize: 16,
          padding: 10,
          fontColor: '#f8f7fc',
        }
      },
      scales: {
        xAxes: [{
          gridLines: {
            display: false
          },
          ticks: {
            display: false,
            beginAtZero: true,
            fontSize: 16
          }
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true,
            fontSize: 16,
            fontColor: '#f8f7fc',
            padding: 10
          }
        }]
      }
    }
  });
};

// Charts.js query for New Cases
app.chartItNewCases = function () {
  let ctx2 = document.getElementById('myChartNewCases').getContext('2d');
  ctx2 = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: dateConfirmedX,
      datasets: [
        {
          label: 'New Confirmed Cases',
          data: newConfirmed,
          fill: false,
          borderColor:
            '#e6e4dd',
          borderWidth: 3,
          order: 1
        }
      ],
    },
    options: {
      tooltips: {
        titleFontSize: 16,
        bodyFontSize: 16
      },
      responsive: false,
      maintainAspectRatio: true,
      legend: {
        labels: {
          fontSize: 16,
          padding: 10,
          fontColor: '#f8f7fc',
        }
      },
      scales: {
        xAxes: [{
          gridLines: {
            display: false
          },
          ticks: {
            display: false,
            beginAtZero: true,
            fontSize: 16
          }
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true,
            fontSize: 16,
            fontColor: '#f8f7fc',
            padding: 10
          }
        }]
      }
    }
  });
}

//Calculate New Cases
app.calcNewCases = function (response1) {
  newConfirmed = []
  newConfirmed.push(0)
  for (let n = 0; n < $(response1).length - 1; n++) {
    newConfirmed.push(parseInt(response1[n + 1].Confirmed) - parseInt(response1[n].Confirmed))
  }
  app.chartItNewCases();
}

//Calculate values and append them to the HTML
app.appendData = function (response1) {
  //Latest data
  let lastDate = dateConfirmedX[dateConfirmedX.length - 1];
  let confirmedCases = 0;
  let recoveredCases = 0;
  let deathsCases = 0;
  let activeCasesFinal = 0;
  for (let n = 0; n < $(response1).length; n++) {
    if (response1[n].Date === lastDate) {
      confirmedCases = (response1[n].Confirmed);
      recoveredCases = (response1[n].Recovered);
      deathsCases = (response1[n].Deaths);
      activeCasesFinal = (response1[n].Active);
    }
  }
  //Previous day's data
  let prevDate = dateConfirmedX[dateConfirmedX.length - 2];
  let confirmedCasesPrev = 0;
  let recoveredCasesPrev = 0;
  let deathsCasesPrev = 0;
  let newConfirmedCases = 0;
  let newRecoveredCases = 0;
  let newDeathCases = 0;
  for (let n = 0; n < $(response1).length; n++) {
    if (response1[n].Date === prevDate) {
      confirmedCasesPrev = (response1[n].Confirmed);
      recoveredCasesPrev = (response1[n].Recovered);
      deathsCasesPrev = (response1[n].Deaths);
      newConfirmedCases = (confirmedCases - confirmedCasesPrev);
      newRecoveredCases = (recoveredCases - recoveredCasesPrev);
      newDeathCases = (deathsCases - deathsCasesPrev);
    }
  }
  //Append data to HTML
  $appendData.append(`
    <div class = "dataTables">
      <h2>${countryName}</h2>
      <h3>New Confirmed</h3>
      <p>${newConfirmedCases}<p>
      <h3>Total Confirmed</h3>
      <p>${confirmedCases}<p>
      <h3>New Deaths</h3>
      <p>${newDeathCases}<p>
      <h3>Total Deaths</h3>
      <p>${deathsCases}<p>
      <h3>New Recovered</h3>
      <p>${newRecoveredCases}<p>
      <h3>Total Recovered</h3>
      <p>${recoveredCases}<p>
      <h3>Active Cases</h3>
      <p>${activeCasesFinal}<p>
      <div class = "chart">
      <canvas id="myChart" style="width:100%" height="500px"></canvas>
      </div>
      <div class = "chart">
      <canvas id="myChartNewCases" style="width:100%" height="500px"></canvas>
      </div>
    </div>
  `);
}

//Get number of Cases by country, import them into arrays for charts
app.cuntriesStatus = function (countrySlug) {
  $("main").show();
  $("header").addClass("afterChangeHeader");
  $.ajax({
    url: `https://api.covid19api.com/total/country/${countrySlug}`,
    method: "GET",
    timeout: 0
  }).done(function (response1) {
    if ($(response1).length === 0) {
      $appendData.append(`
        <div class = "dataTables">
        <h2>${countryEntered}</h2>
        <h3>No Cases Reported!<h3>
        </div>`
      );
      return false;
    }
    casesConfirmedY = []
    dateConfirmedX = []
    casesRecoveredY = []
    casesDeathsY = []
    casesActiveY = []
    for (let n = 0; n < $(response1).length; n++) {
      dateConfirmedX.push((response1[n].Date).substring(0, 10));
      casesConfirmedY.push(response1[n].Confirmed);
      casesRecoveredY.push(response1[n].Recovered);
      casesDeathsY.push(response1[n].Deaths);
      casesActiveY.push(response1[n].Active);
    };
    app.appendData(response1);
    app.calcNewCases(response1);
    app.chartIt();
    app.countriesProvincesConfirmed();
  });
}


//Find SLUG for the selected country
app.showData = function (countryList) {
  for (let i = 0; i < $(countryList).length; i++) {
    countryName = countryList[i].Country;
    if ((countryList[i].Country).toUpperCase() === (countryEntered).toUpperCase()) {
      slug = countryList[i].Slug;
      app.cuntriesStatus(slug);
      //Stop searching for the country as it's found already
      return false;
    }
  }
  //If the country is not on the list, show error messages
  for (let i = 0; i < $(countryList).length; i++) {
    if (countryList[i].Country !== countryEntered) {
      $errorMessage.append(`
        <p>Country is not on the list!</p>
      `).fadeIn().delay(1000).fadeOut().delay(500);
      return false;
    }
  }
}


// Function for jQuery UI autofill country
// adding aditional method to show the end of country name in the input field
// adding aditional method to enter the end of the city if clicked out of the input field
app.jQueryUiFunction = function (location) {
  let firstElement = $(location).data("uiAutocomplete").menu.element[0].children[0]
    , inpt = $(location)
    , original = inpt.val()
    , firstElementText = $(firstElement).text();
  // Check if matching is done by first letters
  if (firstElementText.toLowerCase().indexOf(original.toLowerCase()) === 0) {
    //change the input to the first match
    inpt.val(firstElementText);
    //highlight from end of input
    inpt[0].selectionStart = original.length;
    //highlight to the end
    inpt[0].selectionEnd = firstElementText.length;
  }
}
// adding aditional method to decrease results to 10 by using slice
// jQuery UI script adjusted to search values only by the first letter
app.jqueryUiAutoFill = function () {
  $(function () {
    // Show only unique cities
    // Add to menu
    $(".countryName").autocomplete({
      source: function (request, response) {
        app.results = $.ui.autocomplete.filter(countries, request.term);
        response(app.results.sort().slice(0, 6));
      },
      select: function (event, ui) {
      },
      open: function (event, ui) {
        app.jQueryUiFunction(this);
      },
      close: function (event, ui) {
        app.jQueryUiFunction(this);
      }
    });
  });
}


//Make a list of countries for selection, submit form, show error messages, clear old data & error messages
app.showDataCountries = function (countryList) {
  for (let i = 0; i < $(countryList).length; i++) {
    countries.push(countryList[i].Country);
  }
  app.jqueryUiAutoFill();
  $formSubmit.on('submit', (event) => {
    event.preventDefault();
    countryEntered = $inputText.val();
    $errorMessage.empty();
    if (countryEntered === '') {
      $errorMessage.append(`
          <p>Please enter a country!</p>
        `).fadeIn().delay(1000).fadeOut().delay(500);
      return false;
    };
    $('.dataTables').empty();
    $('.byProvince').remove();
    app.showData(countryList);
    $inputText.val('');
  });
}

//Get a list of countries.
app.init = function () {
  // Hide main section
  $("main").hide();
  $.ajax({
    url: "https://api.covid19api.com/countries",
    method: "GET",
    timeout: 0
  }).then(function (response) {
    app.showDataCountries(response);
  });
};

//Document Ready
$(() => app.init());