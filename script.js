

const generateCityAPIParams = (textInput) => {
    // Replacing all spaces with %20, the symbol for spaces in a query string
    let parsedTextInput = textInput.replace(/ /g, "%20")
    parsedTextInput = parsedTextInput.replace(/ /g, "%2C")
    const url = `https://andruxnet-world-cities-v1.p.rapidapi.com/?query=${parsedTextInput}&searchby=city`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'd01ccd3286msh44660cb4782e04bp150608jsna101c2f50d22',
            'X-RapidAPI-Host': 'andruxnet-world-cities-v1.p.rapidapi.com'
        }
    };
    return [url, options];
}


const getCityData = async (APIParams) => {
    try {  
        //console.log(APIParams)
        const response = await fetch(APIParams[0], APIParams[1]);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error(error);
    }
}

getCityData().then(cities => {
    cities.forEach(city => {
        //console.log(city.city, city.state)
    })
});

// get inputbox element that user types city in
const citySearchBox = document.getElementById("city-search-box");
// add event listener for every time a new character is 
// entered in the city search box element on the page
citySearchBox.addEventListener("input", (event) => {
    let cityList = document.getElementById("cities");
    while(cityList.firstChild) {
       cityList.removeChild(cityList.firstChild);
    }
    const textInput = event.target.value;
    if(textInput.length >= 3) {
        const cityAPIParams = generateCityAPIParams(textInput)
        getCityData(cityAPIParams).then(citySet => {
            // const citySet = createCitySet(cities);
            // Get only 5 results
            for(let i = 0; i < citySet.length; i++) {
                let newCity = document.createElement("option");
                newCity.setAttribute("value", citySet[i].city + ", " + citySet[i].state + ", " + citySet[i].country);
                cityList.appendChild(newCity);
            }
        })
    }
})

// Function for fetching geospatial codes (lat, long)
const getCoordinates = async (cityArr) => {
    const fetchUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityArr[0]},${cityArr[1]}&limit=1&appid=561be9233a319bd7b94859e59933426b`;
    const response = await fetch(fetchUrl);
    const cityData = await response.json();
    return [cityData[0].lat, cityData[0].lon];
}

// Function for fetching the weather data with the coordinates given
const getWeatherData = async (lat, long) => {
    const fetchUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${long}&units=imperial&appid=561be9233a319bd7b94859e59933426b`;
    const response = await fetch(fetchUrl);
    const weatherData = await response.json();
    //console.log(weatherData);
    return [weatherData.current.temp, weatherData.current.humidity, weatherData.current.wind_speed, weatherData.current.weather[0].main];
}

// Make event listener for search button
// 1. get the element in the html for the search button
const searchButton = document.getElementById("search-button");

const processWeatherByCity = (event) => {
    const searchCity = citySearchBox.value;
    const cityArray = searchCity.split(", ", 2);
    getCoordinates(cityArray).then(coordinates => {
        const [lat, long] = coordinates;
        getWeatherData(lat, long).then(weatherData => {
            const [temp, humidity, wind_speed, weatherDescription] = weatherData;
            //console.log(temp, humidity, wind_speed, weatherDescription.toLowerCase());
            // Create the elements in the HTML that need to be dynamic
            const weatherImage = document.getElementById("weather-img");
            const tempElement = document.getElementById("temp");
            const cityElement = document.getElementById("city");
            const humidityElement = document.getElementById("humidity");
            const windElement = document.getElementById("wind");
            // Change the elements to reflect the current weather
            weatherImage.setAttribute("src", `images/${weatherDescription.toLowerCase()}.png`);
            tempElement.innerText = `${Math.trunc(temp)}°F`;
            cityElement.innerText = `${cityArray.join(", ")}`;
            humidityElement.innerText = `${Math.trunc(humidity)}%`;
            windElement.innerText = `${Math.trunc(wind_speed)} mph`;
        });
    })
}

// add event listener
searchButton.addEventListener("click", processWeatherByCity);

getCoordinates(['Cincinnati', 'Ohio']).then(data => {
    // console.log(data);
});

const getCityName = (latitude, longitude) => {
    // console.log(latitude, longitude)
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
  
    fetch(url)
      .then(response => response.json())
      .then(data => {
        return data
      })
      .catch(error => console.error('Error:', error));
}

if ("geolocation" in navigator) {
  /* geolocation is available */
  navigator.geolocation.getCurrentPosition(function(position) {
    getWeatherData(position.coords.latitude, position.coords.longitude).then(weatherData => {
        
        const [temp, humidity, wind_speed, weatherDescription] = weatherData;
        // console.log(temp, humidity, wind_speed, weatherDescription.toLowerCase());
        // Create the elements in the HTML that need to be dynamic
        const weatherImage = document.getElementById("weather-img");
        const tempElement = document.getElementById("temp");
        const cityElement = document.getElementById("city");
        const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=geojson&lat=${position.coords.latitude}&lon=${position.coords.longitude}`;
        fetch(geoUrl)
        .then(response => response.json())
        .then(data => {
            const cityName = (data.features[0].properties.address.city || data.features[0].properties.address.town || data.features[0].properties.address.village || data.features[0].properties.address.municipality);
            const stateName = data.features[0].properties.address.state;
            cityElement.innerText = `${cityName}, ${stateName}`;
        })
        .catch(error => console.error('Error:', error));
        
        const humidityElement = document.getElementById("humidity");
        const windElement = document.getElementById("wind");
        // Change the elements to reflect the current weather
        weatherImage.setAttribute("src", `images/${weatherDescription.toLowerCase()}.png`);
        tempElement.innerText = `${Math.trunc(temp)}°F`;
        
        humidityElement.innerText = `${Math.trunc(humidity)}%`;
        windElement.innerText = `${Math.trunc(wind_speed)} mph`;
    })
  }, function(error) {
    console.error("Error Code = " + error.code + " - " + error.message);
  });
} else {
  /* geolocation IS NOT available */
  console.log("Geolocation is not supported by this browser.");
}
