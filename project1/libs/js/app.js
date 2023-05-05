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
  west: 0
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
const map = L.map("map", {dragging: !L.Browser.mobile, tap: !L.Browser.mobile}).fitWorld();


const mapDesign = L.tileLayer(
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


mapDesign.addTo(map);

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
  capitalMarker = L.marker([clickLocationLat, clickLocationLng], {icon: landmarkMarker}).addTo(map).bindPopup(
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
  $("#item-A").html(country.officialName);
  $("#item-B").html("Local time");
   $("#item-2").html(`${country.currentHours}:${country.currentMinutes}${country.amOrPm}`);
  $("#item-C").html("Capital city");
  $("#item-3").html(country.capital);
  $("#item-D").html("Population");
  $("#item-4").html(country.population.toFixed(2) + "m");
  $("#item-E").html("Area");
  $("#item-5").html(`${country.area} km&sup2;`);
  $("#item-F").html("Inhabitants");
  $("#item-6").html(country.demonym);
    $("#item-G").html("Main language(s)");
  const languages = Object.values(country.languages);

  $("#item-7").html(`${languages[0]}`);
  if (languages.length > 1) {
    for (let i = 1; i < languages.length; i++) {
      $("#item-7").append(`<br>${languages[i]}`);
    }
  }

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
  country.weatherDescription = results.current.weather[0].description;
  country.maxtemp = Math.round(results.daily[0].temp.max);
  country.mintemp = Math.round(results.daily[0].temp.min);
  country.windspeed = 2.23694 *parseFloat(results.daily[0].wind_speed).toFixed(0);
  country.weathericon = results.current.weather[0].icon;
  country.humidity = results.current.humidity;
};

const displayWeather = () => {
  $("#item-A").html(`The Weather in ${country.capital}`);
  let weather = (screenSize.matches) ? 
            `https://openweathermap.org/img/wn/${country.weathericon}@2x.png`
    : `https://openweathermap.org/img/wn/${country.weathericon}.png`;
    
    $("#item-2").html(`<img src="${weather}" alt="Weather conditions">`)  
  
  $("#item-C").html("Maximum");
  $("#item-3").html(`${country.maxtemp}&#176;C`);
  $("#item-D").html("Minimum");
  $("#item-4").html(`${country.mintemp}&#176;C`);
  $("#item-E").html("Wind speed");
  $("#item-5").html(`${country.windspeed} mph`);
  $("#item-F").html("Humidity %");
  $("#item-6").html(`${country.humidity}%`);
  $("#item-7").html(country.weatherDescription);
   
};

const getMoneyData = (data) => {
  const results = data.data.conversion_rates;
  country.USDexchange = results.USD;
  country.EURexchange = results.EUR;

};

const displayMoney = () => {
  $("#item-A").html(`${country.demonym} currency (${country.currency})`);

  $("#item-B").html("Currency");
  $("#item-2").html(country.currencyName);
  $("#item-C").html("Symbol");
  $("#item-3").html(country.currencySymbol);
  $("#item-E").html("Exchange Rate with US $");
  $("#item-5").html(country.USDexchange);
  $("#item-F").html("Exchange Rate with Euros &#8364;");
  $("#item-6").html(country.EURexchange);
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
  let earthquakeMarker = L.marker([earthquake.lat, earthquake.lng], {icon: quakeMarker}).bindPopup(
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
  let wikiMarker = L.marker([wikiEntry.lat, wikiEntry.lng], {icon: aWikiMarker}).bindPopup(`<strong>${wikiEntry.title}</strong><br>${wikiEntry.summary}<br><a href="https://${wikiEntry.wikipediaUrl}" target="_blank">Wiki Link</a>`);
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
  let regionMarker = L.marker([region.lat, region.lng], {icon: aRegionMarker}).bindPopup(`<strong>${region.adminName1}</strong><br>population ${region.population.toLocaleString("en-US")}`);
    regionMarkers.addLayer(regionMarker);
  })
  regionMarkerLayer = regionMarkers.addTo(map).bringToFront();
  callApi("getWeather", clickLocationLat, clickLocationLng, getWeatherData, "metric");
  callApi("getMoney", country.currency, "", getMoneyData);
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
  console.log(parameter1, parameter2)
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
