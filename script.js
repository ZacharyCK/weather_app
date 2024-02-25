const generateCityAPIParams = (textInput) => {
    // Replacing all spaces with %20, the symbol for spaces in a query string
    parsedTextInput = textInput.replace(/ /g, "%20")
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
        console.log(APIParams)
        const response = await fetch(APIParams[0], APIParams[1]);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error(error);
    }
}

getCityData().then(cities => {
    cities.forEach(city => {
        console.log(city.city, city.state)
    })
});

// creates city set to eliminate duplicate cities in the city list
const createCitySet = (cities) => {
    const filteredCities = new Array();
    filteredCities.push(cities[0]);
    for(let i = 1; i < cities.length; i++) {
        // Set limit to make only 5 elements in the filteredCities array
        let indexLimit = 0;
        for(let j = 0; j < filteredCities.length; j++) {
            if (cities[i].city === filteredCities[j].city && cities[i].state === filteredCities[j].state && cities[i].country === filteredCities[j].country) {
                continue;
            } else if (j === filteredCities.length - 1 && indexLimit < 5) {
                filteredCities.push(cities[i]);
                indexLimit++;
            } else {
                break;
            }
        }
    }
    return filteredCities;
}

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
        getCityData(cityAPIParams).then(cities => {
            const citySet = createCitySet(cities);
            // Get only 5 results
            if(citySet.length > 5) {
                for(let i = 0; i < 5; i++) {
                    let newCity = document.createElement("option");
                    newCity.setAttribute("value", citySet[i].city + ", " + citySet[i].state);
                    cityList.appendChild(newCity);
                }
            } else {
                for(let i = 0; i < citySet.length; i++) {
                    let newCity = document.createElement("option");
                    newCity.setAttribute("value", citySet[i].city + ", " + citySet[i].state);
                    cityList.appendChild(newCity);
                }
            }
            
        })
    }
})
