import { mapToken } from "./config.js";

const country = {
  iso2: "",
  iso3: "",
  population: 0,
  countryName: "",
  currency: "",
  capital: "",
  geonameId: 0,
  area: 0,
  currentHours: 0,
  currentMinutes: 0,
  amOrPm: 'am',
  mintemp: 0,
  maxtemp: 0,
  windspeed: 0,
  weathericon: "",
  humidity: 0,
  weatherDescription: "",
  USDexchange: 0,
  EURexchange: 0,
  officialName: "",
  demonym: "",
  currencyName: "",
  currencySymbol: "",
  languages: [],
  north: 0,
  south: 0,
  east: 0,
  west: 0,
  newsTitle: "",
  newsTitle2: "",
  newsTitle3: "",
  newsTitle4: "",
  newsLink: "",
  newsLink2: "",
  newsLink3: "",
  newsLink4: "",
  newsImage: "",
  newsImage2: "",
  newsImage3: "",
  newsImage4: "",

};


let clickLocationLat = 0;
let clickLocationLng = 0;

let timeoffset = 0;
let polyGonLayer;
let wikiMarkerLayer;
let earthquakeMarkerLayer;
let regionMarkerLayer;
let capitalMarker;
let mapOptions;
let centerOnLat;
let centerOnLong;


let screenSize = window.matchMedia("(min-width: 400px)");
let geoJsonFeature = {type: "loading"};
const earthquakeMarkers = L.markerClusterGroup();
const wikiMarkers = L.markerClusterGroup();
const regionMarkers = L.markerClusterGroup();


//Setting up Leaflet maps


const streets = L.tileLayer(
  "https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key={accessToken}", //map layer
  {
    attribution:
    '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>', //map engine
    minZoom: 0,
    maxZoom: 22,
    subdomains: "abcd",
    accessToken: mapToken,
    crossOrigin: "",
  }
);

const map = L.map('map', {
  layers: [streets]
}).setView([54.5, -4], 6);

 const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
 });

var basemaps = {
   "Streets": streets,
   "Satellite": satellite
 };

const overlays = {
  "Earthquake": earthquakeMarkers, 
   "Region": regionMarkers,
 "Wikipedia": wikiMarkers
 };

 L.control.layers(basemaps, overlays).addTo(map);





const foundLocation = (e) => {
  clickLocationLat = e.latlng.lat;
  clickLocationLng = e.latlng.lng;
  initialiseMaps(clickLocationLat, clickLocationLng)
};

const locationError = (e) => {
  clickLocationLat = 51.50853;
  clickLocationLng = -0.12574;
  initialiseMaps(clickLocationLat, clickLocationLng)
};

map.on("locationfound", foundLocation);
map.on("locationerror", locationError);

map.locate({ setView: `{clickLocationLat, clickLocationLng}`, maxZoom: 5 })


map.on("click", function (e) {
  clickLocationLat = e.latlng.lat;
  clickLocationLng = e.latlng.lng;
  initialiseMaps(clickLocationLat, clickLocationLng)
});

$("#countrySelect").change(function () {
  country.iso2 = $("#countrySelect option:selected").val();
  getData()
});


const initialiseMaps = (clickLocationLat, clickLocationLng) => {

  getSelectData();
  
  getCountryCode(clickLocationLat, clickLocationLng);
}

const getData = () => {

if (geoJsonFeature.type !== 'loading') {
  resetMap()
}

  callApi("getCountryInfo", "en", country.iso2, getBasicInfo);
  callApi("getPolygon", country.iso2, "", displayPolygon);
}

const getCountryCode = (lat, lng) => {
  callApi("getCountryCode", lat, lng, useCountryCode);
};


const useCountryCode = (data) => {
  $('#countrySelect').val(`${data.data}`).change()
};


$("#closeModal").click(function () {
  $(".modal").modal('hide', function () {});
});

L.easyButton('fa-solid fa-circle-info', function(btn,_) {  
  btn.button.style.color = 'lightblue';
  resetModal()
  displayTopLevel() 



  $(".modal").modal('show');}, function () {}).addTo(map);


L.easyButton('fa-cloud-sun-rain', function (btn,_) {
  btn.button.style.color = 'lightblue';
  resetModal()
  displayWeather() 
  $(".modal").modal('show');}, function () {}).addTo(map);

L.easyButton('fa-solid fa-money-bill-transfer', function (btn,_) {
  btn.button.style.color = 'lightblue';
  resetModal()
  displayMoney()
  $(".modal").modal('show');}, function() {}).addTo(map);

  L.easyButton('far fa-newspaper', function () {
  resetModal()
    displayNews()  
  $(".modal").modal('show');}, function() {

  }).addTo(map);

L.easyButton('fas fa-search-minus', function() {
  map.setView([centerOnLat, centerOnLong], 5)
}).addTo(map);



const getSelectData = () => {
  callApi("getSelectData", "", "", displaySelectData);
};

const displaySelectData = (data) => {
  const results = data.data;
  for (let i = 0; i < results.length; i++) {
    const selectOption = results[i][0];
    const isoOption = results[i][1];
    $("#countrySelect").append(
      `<option value="${isoOption}">${selectOption}</option>`
    );
  }
};

const getNews = (data) => {
  const results = data.data;
  const defaultImage = "libs/breaking_news.png";

  // Reset news properties
  country.newsData = [];

  for (let i = 0; i < results.length; i++) {
    const newsEntry = results[i];
    const title = newsEntry.title;
    const link = newsEntry.link;
    const image = newsEntry.image_url || defaultImage;
    const sourceId = newsEntry.source_id;

    // Store news data in an array of objects
    country.newsData.push({
      title: title,
      link: link,
      image: image,
      sourceId: sourceId,
    });
  }
};


const displayNews = () => {
  const defaultImage = "libs/breaking_news.png";

  $("#item-A").html("Latest News");

  // Clear previous news items
  $(".newsItem").remove();

  for (let i = 0; i < country.newsData.length; i++) {
    const newsEntry = country.newsData[i];
    const newsImage = newsEntry.image || defaultImage;
    const newsLink = newsEntry.link;
    const newsTitle = newsEntry.title;
    const sourceId = newsEntry.sourceId;

    const imageElement = `<img class="newsImage" src="${newsImage}" onerror="this.src='${defaultImage}';">`;
    const titleElement = `<a href="${newsLink}" target="_blank">${newsTitle}</a>`;
    const sourceElement = `<p id="source">${sourceId}</p>`;

    const newsItem = `
      <div class="row border-bottom newsItem">
        <div class="col">
          ${imageElement}
        </div>
        <div class="col">
          <div class="row">
            <div class="col">
              ${titleElement}
            </div>
          </div>
          <div class="row">
            <div class="col">
              ${sourceElement}
            </div>
          </div>
        </div>
      </div>
    `;

    $("#item-A").after(newsItem);
  }
};




const getBasicInfo = (data) => {
  const results = data.data[0];
  country.north = results.north;
  country.south = results.south;
  country.east = results.east;
  country.west = results.west;
  country.geonameId = results.geonameId;
  
  centerOnLat = (results.north + results.south) / 2;
  centerOnLong = (results.east + results.west) / 2;

  mapOptions = {
    lat: centerOnLat,
    lng: centerOnLong,
    zoom: 5,
  };
  
  map.fitBounds(polyGonLayer.getBounds()).panTo(mapOptions);
  country.population = parseFloat(results.population / 1000000);
  country.countryName = results.countryName;
  country.currency = results.currencyCode;
  country.capital = results.capital;
  country.iso3 = results.isoAlpha3;


  country.area = Math.round(results.areaInSqKm).toLocaleString("en-US");

  $("#titleCountry").html(country.countryName);

  callApi("getMoreCountryInfo", country.iso2, country.currency, saveMoreBasicInfo);
  
    let countryCapitalMinusSpaces = country.capital.split(" ").join("_");
    
    callApi("getCapitalCoords", countryCapitalMinusSpaces, "", zoomToPlace);
  
};


const saveMoreBasicInfo = (data) => {
  country.officialName = data.officialName;
  country.demonym = data.demonym;
  country.currencyName = data.currencies.name;
  country.currencySymbol = data.currencies.symbol;
  country.languages = data.languages;

  
 };


const zoomToPlace = (data) => {
  
    clickLocationLat = data.data.lat;
    clickLocationLng = data.data.lng;
    
  
  const sunrise = data.sunrise;
  timeoffset = data.timeoffset;
  const sunriseString = getSunrise(sunrise);
  setCurrentTime(timeoffset);

  let landmarkMarker = L.ExtraMarkers.icon({
    icon: 'fa-star-half-alt',
    markerColor: 'purple',
    shape: 'star',
    prefix: 'fa',
  })
  capitalMarker = L.marker([clickLocationLat, clickLocationLng], {icon: landmarkMarker}).addTo(map).bindTooltip(
        `The capital of ${country.countryName} is ${country.capital}. <br>${sunriseString}`);

callApi("getEarthquakes", country.north, country.south, displayEarthq, country.east, country.west);
callApi("getWiki", country.north, country.south, displayWiki, country.east, country.west);

callApi("getCountryRegions", country.geonameId, '', displayRegions);


};

const getSunrise = (sunrise) => {
  const date = new Date(sunrise * 1000);
  const hours = date.getUTCHours().toString().padStart(2, 0);
  const minutes = date.getUTCMinutes().toString().padStart(2, 0);
  const seconds = date.getUTCSeconds().toString().padStart(2, 0);
  return `The sun rose at ${hours}:${minutes}:${seconds}`;
};

const setCurrentTime = (timeoffset) => {
  const currentTime = Date.now();
  const time = new Date(currentTime + timeoffset * 1000);
  country.currentHours = time.getUTCHours().toString();
  country.currentMinutes = time.getUTCMinutes().toString().padStart(2, 0);
  country.amOrPm = (country.currentHours < 12) ? 'am' : 'pm';
  if (country.currentHours > 12) {
    country.currentHours = country.currentHours - 12;
  }  

};


const displayPolygon = (data) => {

  if (data.data.length > 1) {
    geoJsonFeature = {
      type: "Feature",
      geometry: {
        type: "MultiPolygon",
        coordinates: data.data,
      },
    };
  } else {
    geoJsonFeature = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: data.data,
      },
    };
  }

polyGonLayer = L.geoJson(geoJsonFeature, {
    style: { color: "#35ffac", opacity: "0.6", weight: "2" },
  })
  polyGonLayer.addTo(map).bringToBack();
};

const displayTopLevel = () => {
  $("#moneyConverter").remove();
  $(".newsItem").remove();
  $("#item-B").removeClass("col-12");
  $("#item-A").html(country.officialName);
  $("#item-B").html("Local time");
  $("#item-2").html(`${country.currentHours}:${country.currentMinutes}${country.amOrPm}`);
  $("#item-C").html("Capital city");
  $("#item-3").html(country.capital);
  $("#item-D").html("Population");
  $("#item-4").html(country.population.toFixed(2) + "m");
  $("#item-F").html("Inhabitants");
  $("#item-6").html(country.demonym);

  const languages = Object.values(country.languages);
  let languagesHtml = "";

  if (languages.length > 0) {
    languagesHtml = languages.join("<br>");
  }

  $("#item-E").html("Languages");
  $("#item-5").html(languagesHtml);
};





const resetModal = () => {
  $("#item-A").html("");
  $("#item-B").html("");
  $("#item-2").html("");
  $("#item-C").html("");
  $("#item-3").html("");
  $("#item-D").html("");
  $("#item-4").html("");
  $("#item-E").html("");
  $("#item-5").html("");
  $("#item-F").html("");
  $("#item-6").html("");
  $("#item-G").html("");
  $("#item-7").html("");
    }


    const getWeatherData = (data) => {
      const results = data.data;
    
      // Get weather data for today
      country.weatherDescriptionToday = results.current.weather[0].description;
      country.maxTempToday = Math.round(results.daily[0].temp.max);
      country.minTempToday = Math.round(results.daily[0].temp.min);
      country.weatherIconToday = results.current.weather[0].icon;
    
      // Get weather data for tomorrow
      country.weatherDescriptionTomorrow = results.daily[1].weather[0].description;
      country.maxTempTomorrow = Math.round(results.daily[1].temp.max);
      country.minTempTomorrow = Math.round(results.daily[1].temp.min);
      country.weatherIconTomorrow = results.daily[1].weather[0].icon;
    
      // Get weather data for the day after tomorrow
      country.weatherDescriptionDayAfter = results.daily[2].weather[0].description;
      country.maxTempDayAfter = Math.round(results.daily[2].temp.max);
      country.minTempDayAfter = Math.round(results.daily[2].temp.min);
      country.weatherIconDayAfter = results.daily[2].weather[0].icon;
    };
    

  const displayWeather = () => {
  $("#moneyConverter").remove();
   $(".newsItem").remove();
  $("#item-A").html(`The Weather in ${country.capital}`);

  const currentDate = new Date();
  const tomorrow = new Date(currentDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(currentDate);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const todayText = "TODAY";
  const tomorrowText = formatDateWithOrdinalSuffix(tomorrow);
  const dayAfterText = formatDateWithOrdinalSuffix(dayAfterTomorrow);

  const weatherToday = `
    <div class="row mb-3" id="weathertoday1" >
      <div class="col-12 border m-2 ">
        <p class="fw-bold fs-5 mt-3">${todayText}</p>
        <div class="row align-items-center">
          <div class="col text-center m-2">
            <p id="todayConditions" class="fw-bold fs-6"></p>
          </div>
          <div class="col text-center">
          <img id="todayIcon" class="weather-icon mt-0" src="https://openweathermap.org/img/wn/${country.weatherIconToday}.png" alt="Weather icon">
          </div>
          <div class="col text-center">
            <p class="fw-bold fs-4 mb-0"><span id="todayMaxTemp">${country.maxTempToday}</span><sup>o</sup><span class="tempMetric">C</span></p>
            <p class="fs-5 mt-0 text-secondary"><span id="todayMinTemp">${country.minTempToday}</span><sup>o</sup><span class="tempMetric">C</span></p>
          </div>
        </div>
      </div>
    </div>
  `;

  const weatherTomorrow = `
    <div class="row mb-3">
      <div class="col-md border m-2">
        <p class="fw-bold fs-5 mt-3">${tomorrowText}</p>
        <div class="row">
          <div class="col text-center m-2">
            <p id="tomorrowConditions" class="fw-bold fs-6"></p>
          </div>
          <div class="col text-center">
          <img id="tomorrowIcon" class="weather-icon mt-0" src="https://openweathermap.org/img/wn/${country.weatherIconTomorrow}.png" alt="Weather icon">
          </div>
          </div>
          <div class="col text-center">
            <p class="fw-bold fs-4 mb-0"><span id="tomorrowMaxTemp">${country.maxTempTomorrow}</span><sup>o</sup><span class="tempMetric">C</span></p>
            <p class="fs-5 mt-0 text-secondary"><span id="tomorrowMinTemp">${country.minTempTomorrow}</span><sup>o</sup><span class="tempMetric">C</span></p>
          </div>
        </div>
      </div>
    </div>
  `;

  const weatherDayAfter = `
    <div class="row mb-3">
      <div class="col border m-2">
        <p class="fw-bold fs-5 mt-3">${dayAfterText}</p>
        <div class="row">
          <div class="col text-center m-2">
            <p id="dayAfterConditions" class="fw-bold fs-6"></p>
          </div>
          <div class="col text-center">
          <img id="dayAfterIcon" class="weather-icon mt-0" src="https://openweathermap.org/img/wn/${country.weatherIconDayAfter}.png" alt="Weather icon">          </div>
          <div class="col text-center">
            <p class="fw-bold fs-4 mb-0"><span id="dayAfterMaxTemp">${country.maxTempDayAfter}</span><sup>o</sup><span class="tempMetric">C</span></p>
            <p class="fs-5 mt-0 text-secondary"><span id="dayAfterMinTemp">${country.minTempDayAfter}</span><sup>o</sup><span class="tempMetric">C</span></p>
          </div>
        </div>
      </div>
    </div>
  `;
  $("#item-B").removeClass("col-12");
  $("#item-B").removeClass("col-md");
  $("#item-B").addClass("col-12");
  $("#item-B").html(weatherToday);
  $("#item-C").html(weatherTomorrow);
  $("#item-3").html(weatherDayAfter);


};

    
    
    
    const formatDateWithOrdinalSuffix = (date) => {
      const day = date.getDate();
      const suffix = getOrdinalSuffix(day);
      const formattedDate = date.toLocaleString("en-US", { weekday: "long" });
      return `${formattedDate} ${day}${suffix}`;
    };
    
    const getOrdinalSuffix = (number) => {
      if (number >= 11 && number <= 13) {
        return "th";
      }
      const lastDigit = number % 10;
      switch (lastDigit) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };
    
    
    
    


const getMoneyData = (data) => {
  const results = data.data.conversion_rates;

  for (const currency in results) {
    if (results.hasOwnProperty(currency)) {
      country[`${currency}exchange`] = results[currency];
    }
  }
};

const displayMoney = () => {
  $(".newsItem").remove();
  $("#item-B").removeClass("col-12");
  $("#item-A").html(`${country.demonym} currency (${country.currency})`);
  $("#item-B").html("Currency");
  $("#item-2").html(country.currencyName);
  $("#item-C").html("Symbol");
  $("#item-3").html(country.currencySymbol);
  

  // Check if the moneySection element exists within the current modal
  let moneySection = $("#modalMoneySection");
  if (moneySection.length === 0) {
    // Create the moneySection element if it doesn't exist
    moneySection = $('<div class="col m-2" id="modalMoneySection"></div>');
    $(".modal-body .container").append(moneySection);
  }

  // Currency Converter
  const converterHtml = `
  <div id="moneyConverter">
  <div class="row mb-3">
    <div class="col">
      <label for="amount" class="ms-2 mb-3"><strong>Converter:</strong></label>
      <input type="number" id="amount" placeholder="Enter amount" />
    </div>
    <div class="col">
      <label for="convertTo" class="ms-2 mb-3 px-2" >Convert to:</label>
      <select class="px-4 ms-2" id="convertTo">
        ${getCurrencyOptions()} <!-- Generate currency options here -->
      </select>
    </div>
  </div>
  <div class="row">
    <div class="col">
      <button id="convertBtn" class="btn btn-primary">Convert</button>
    </div>
  </div>
  <div class="row">
    <div class="col" id="result"></div>
  </div>
</div>

  `;

  moneySection.html(converterHtml);

  $("#convertBtn").click(convertCurrency);
};

const getCurrencyOptions = () => {
  let optionsHtml = "";

  for (const currency in country) {
    if (country.hasOwnProperty(currency) && currency.includes("exchange")) {
      const currencyCode = currency.replace("exchange", "");
      optionsHtml += `<option value="${currencyCode}">${currencyCode}</option>`;
    }
  }

  return optionsHtml;
};

const convertCurrency = () => {
  const amount = $("#amount").val();
  const convertTo = $("#convertTo").val();
  const exchangeRate = country[`${convertTo}exchange`];

  if (!exchangeRate) {
    $("#result").html("Exchange rate not available for the selected currency.");
    return;
  }
  const convertedAmount = amount * exchangeRate;
  $("#result").html(`Converted Amount: ${convertedAmount}`);
};


//populate markers
const displayEarthq = (data) => {
  const results = data.data.earthquakes;
  
  let severity; 
  results.map((earthquake) => {
  switch (true) {
  case (earthquake.magnitude < 4):
  severity = 'Light';
  break;
  case (earthquake.magnitude < 6):
  severity = 'Moderate';
  break;
  case (earthquake.magnitude < 8):
  severity = 'Strong';
  break;
  case (earthquake.magnitude < 10):
  severity = 'Great';
   break;
  default:
  severity = 'Recorded'
  break;
  }
  let quakeMarker = L.ExtraMarkers.icon({
    icon: "fa-solid fa-house-crack",
    shape: 'round',
    prefix: 'fa'
  })
  let earthquakeMarker = L.marker([earthquake.lat, earthquake.lng], {icon: quakeMarker}).bindTooltip(
      `${severity} earthquake on ${earthquake.datetime} - magnitude ${earthquake.magnitude}`
);
    earthquakeMarkers.addLayer(earthquakeMarker);
  })
  earthquakeMarkerLayer = earthquakeMarkers.addTo(map).bringToFront();
};


const displayWiki = (data) => {
  const results = data.data.geonames;
   results.map((wikiEntry) => {
    let aWikiMarker = L.ExtraMarkers.icon({
    icon: 'fa-brands fa-wikipedia-w',
    markerColor: 'cyan',
    shape: 'square',
    prefix: 'fa'
  })
  let wikiMarker = L.marker([wikiEntry.lat, wikiEntry.lng], {icon: aWikiMarker}).bindTooltip(`<strong>${wikiEntry.title}</strong><br>${wikiEntry.summary}<br><a href="https://${wikiEntry.wikipediaUrl}" target="_blank">Wiki Link</a>`);
    wikiMarkers.addLayer(wikiMarker);
  })
  wikiMarkerLayer = wikiMarkers.addTo(map).bringToFront();
};

const displayRegions = (data) => {
  
  const results = data.data;
   results.map((region) => {
    let aRegionMarker = L.ExtraMarkers.icon({
    icon: 'fa-map-marked-alt',
    markerColor: 'blue',
    shape: 'star',
    prefix: 'fa'
  })
  let regionMarker = L.marker([region.lat, region.lng], {icon: aRegionMarker}).bindTooltip(`<strong>${region.adminName1}</strong><br>population ${region.population.toLocaleString("en-US")}`);
    regionMarkers.addLayer(regionMarker);
  })
  regionMarkerLayer = regionMarkers.addTo(map).bringToFront();
  callApi("getWeather", clickLocationLat, clickLocationLng, getWeatherData, "metric");
  callApi("getMoney", country.currency, "", getMoneyData);
  callApi("getNews", country.iso2, country.demonym, getNews);
 };


const resetMap = () => {
  map.removeLayer(polyGonLayer)
  wikiMarkerLayer.clearLayers()   
  regionMarkerLayer.clearLayers()   
  earthquakeMarkerLayer.clearLayers()
  capitalMarker.remove()  
  wikiMarkers.remove()
  earthquakeMarkers.remove()
  regionMarkers.remove()  
}


const callApi = (phpToCall, parameter1, parameter2, callbackFun, parameter3, parameter4) => {
  console.log(parameter1, parameter2);
  const apiUrl = `libs/php/${phpToCall}.php`;
  $.ajax({
    url: apiUrl,
    type: "POST",
    dataType: "json",
    data: {
      param1: parameter1,
      param2: parameter2,
      param3: parameter3,
      param4: parameter4,
      apiKey: "<?php echo $newsKey; ?>", // Include the API key here
    },
    success: function (result) {
      callbackFun(result);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(`${apiUrl}: call failed ${textStatus}`);
      console.log(errorThrown);
    },
  });
};
