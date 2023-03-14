window.addEventListener("load", () => {
    let longitude;
    let latitude;
    let temperatureDescription = document.querySelector(".temperature-description");
    let temperatureDegree = document.querySelector(".temperature-degree");
    let locationTimezone = document.querySelector(".location-timezone");
    let hourlyTable = document.querySelector(".hourly-table");
    let buttons = document.querySelectorAll("nav button");
    const degreeSpan = document.querySelector("nav span");
    let currentSection = document.querySelector(".current");
    let hourlySection = document.querySelector(".hourly");
    let dailySection = document.querySelector(".daily");

    //Select between current, hourly, or daily forecasts
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", () => {
            let selectedWindow = buttons[i].getAttribute("data-button");
            switch (selectedWindow) {
                case "current":
                    currentSection.style.display = "flex";
                    hourlySection.style.display = "none";
                    dailySection.style.display = "none";
                    buttons[0].style.color= "rgb(255, 140, 0)";
                    buttons[1].style.color= "white";
                    buttons[2].style.color= "white";
                    buttons[0].style.borderColor= "rgb(255, 140, 0)";
                    buttons[1].style.borderColor= "white";
                    buttons[2].style.borderColor= "white";
                    break;

                case "hourly":
                    currentSection.style.display = "none";
                    hourlySection.style.display = "flex";
                    dailySection.style.display = "none";
                    buttons[0].style.color= "white";
                    buttons[1].style.color= "rgb(255, 140, 0)";
                    buttons[2].style.color= "white";
                    buttons[0].style.borderColor= "white";
                    buttons[1].style.borderColor= "rgb(255, 140, 0)";
                    buttons[2].style.borderColor= "white";
                    break;

                case "daily":
                    currentSection.style.display = "none";
                    hourlySection.style.display = "none";
                    dailySection.style.display = "flex";
                    buttons[0].style.color= "white";
                    buttons[1].style.color= "white";
                    buttons[2].style.color= "rgb(255, 140, 0)";
                    buttons[0].style.borderColor= "white";
                    buttons[1].style.borderColor= "white";
                    buttons[2].style.borderColor= "rgb(255, 140, 0)";
                    break;

                default:
                    currentSection.style.display = "flex";
                    hourlySection.style.display = "none";
                    dailySection.style.display = "none";
                    buttons[0].style.color= "white";
                    buttons[1].style.color= "white";
                    buttons[2].style.color= "white";
                    buttons[0].style.borderColor= "white";
                    buttons[1].style.borderColor= "white";
                    buttons[2].style.borderColor= "white";
                    break;
            }
        });
    }

    //Check if browser provides location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            //Find local location
            longitude = position.coords.longitude;
            latitude = position.coords.latitude;

            //APIs that will provide weather and location information
            const api = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=fahrenheit&timezone=auto`;
            const cityApi = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
            fetch(api)
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    //Daily variables
                    const { temperature, weathercode, time } = data.current_weather;

                    //Hourly variables
                    const hourlyTemperature = data.hourly.temperature_2m;
                    const hourlyTime = data.hourly.time;
                    const hourlyWeathercode = data.hourly.weathercode;

                    //Daily variables
                    const dailyMaxTemperature = data.daily.temperature_2m_max;
                    const dailyMinTemperature = data.daily.temperature_2m_min;
                    const dailyWeathercode = data.daily.weathercode;
                    const days = data.daily.time;

                    //Set current window elements using API data
                    let currentTime = time.substring(time.length - 5);
                    temperatureDegree.textContent = Math.floor(temperature);
                    setIconsAndDescription(weathercode, currentTime);

                    //Show only hours ahead of current time
                    let today = new Date();
                    let now = today.getHours();
                    let x = 0;

                    while (x < now) {
                        hourlyTemperature.shift();
                        hourlyTime.shift();
                        hourlyWeathercode.shift();
                        x++;
                    }

                    //Create hourly forecast table
                    for (let i = 0; i < 48; i++) {
                        let row = hourlyTable.insertRow(i);
                        let timeCell = row.insertCell(0);
                        timeCell.innerHTML = hourlyTime[i].substring(hourlyTime[i].length - 5);
                        let temperatureCell = row.insertCell(1);
                        temperatureCell.innerHTML = Math.floor(hourlyTemperature[i]);
                        temperatureCell.className = "hourly-temperature";
                        temperatureCell.setAttribute("data-temp", hourlyTemperature[i]);
                        let iconCell = row.insertCell(2);
                        iconCell.innerHTML = `<canvas class="icon${i}" data-weathercode="${hourlyWeathercode[i]}"width="50" height="50"></canvas>`;
                        setHourlyIcons(hourlyWeathercode[i], timeCell.innerHTML, i);
                    }

                    //Create divs for daily forecast
                    for (let i = 0; i < days.length; i++) {

                        //Create elements
                        const dayDiv = document.createElement("div");
                        const dayDate = document.createElement("h3");
                        const dayIcon = document.createElement("canvas");
                        const dayMax = document.createElement("p");
                        const dayMin = document.createElement("p");

                        //Assign attributes, classes, and text content to newly created elements
                        dayDiv.className = `day day${i}`;
                        dayDate.innerHTML = days[i].substring(5);
                        dayIcon.setAttribute("width", "50px");
                        dayIcon.setAttribute("height", "50px");
                        dayIcon.className = `dailyIcon${i}`;
                        dayMax.innerHTML = Math.floor(dailyMaxTemperature[i]);
                        dayMax.setAttribute("data-temp", dailyMaxTemperature[i]);
                        dayMin.innerHTML = Math.floor(dailyMinTemperature[i]);
                        dayMin.setAttribute("data-temp", dailyMinTemperature[i]);

                        //Add new elements to the daily forecast window
                        dailySection.appendChild(dayDiv);
                        dayDiv.append(dayDate);
                        dayDiv.appendChild(dayIcon);
                        dayDiv.appendChild(dayMax);
                        dayDiv.appendChild(dayMin);

                        setDailyIcons(dailyWeathercode[i], i);
                    }

                    //Celsius formula
                    let celsius = (temperature - 32) * (5 / 9);

                    //Change temperature unit
                    let hours = document.querySelectorAll(".hourly-temperature");
                    let dailyTemperatures = document.querySelectorAll(".day p");
                    degreeSpan.addEventListener("click", () => {
                        if (degreeSpan.textContent === "°F") {
                            degreeSpan.textContent = "°C";
                            temperatureDegree.textContent = Math.floor(celsius);
                            for (const hour of hours) {
                                hour.textContent = Math.floor((hour.innerHTML - 32) * (5 / 9));
                            }
                            for (const dailyTemp of dailyTemperatures) {
                                dailyTemp.textContent = (Math.floor((dailyTemp.innerHTML - 32) * (5 / 9)));
                            }
                        } else {
                            degreeSpan.textContent = "°F";
                            temperatureDegree.textContent = Math.floor(temperature);
                            for (const hour of hours) {
                                hour.textContent = Math.floor(hour.getAttribute("data-temp"));
                            }
                            for (const dailyTemp of dailyTemperatures) {
                                dailyTemp.textContent = (Math.floor((dailyTemp.getAttribute("data-temp"))));
                            }
                        }
                    });
                });

            fetch(cityApi)
                .then(response => {
                    return response.json();
                })
                .then(city => {
                    const { locality, principalSubdivision, countryCode } = city;
                    locationTimezone.textContent = `${locality}, ${principalSubdivision}, ${countryCode}`;
                });

            //Function to set the icon and description of current weather conditions
            function setIconsAndDescription(weathercode, time) {
                const skycons = new Skycons({ color: "white" });
                let iconID = document.querySelector(".currentIcon");
                let currentIcon;
                switch (weathercode) {
                    case 0:
                        temperatureDescription.textContent = "Clear sky";
                        if (time.substring(0, 2) > 18 || time.substring(0, 2) < 6) {
                            currentIcon = Skycons.CLEAR_NIGHT;
                        } else {
                            currentIcon = Skycons.CLEAR_DAY;
                        }
                        break;
                    case 1:
                        temperatureDescription.textContent = "Mainly clear";
                        if (time.substring(0, 2) > 18) {
                            currentIcon = Skycons.CLEAR_NIGHT;
                        } else {
                            currentIcon = Skycons.CLEAR_DAY;
                        }
                        break;
                    case 2:
                        temperatureDescription.textContent = "Partly cloudy";
                        if (time.substring(0, 2) > 18 || time.substring(0, 2) < 6) {
                            currentIcon = Skycons.PARTLY_CLOUDY_NIGHT;
                        } else {
                            currentIcon = Skycons.PARTLY_CLOUDY_DAY;
                        }
                        break;
                    case 3:
                        temperatureDescription.textContent = "Overcast";
                        currentIcon = Skycons.CLOUDY;
                        break;
                    case 45:
                        temperatureDescription.textContent = "Fog";
                        currentIcon = Skycons.FOG;
                        break;
                    case 48:
                        temperatureDescription.textContent = "Depositing rime fog";
                        currentIcon = Skycons.FOG;
                        break;
                    case 51:
                        temperatureDescription.textContent = "Light drizzle";
                        currentIcon = Skycons.RAIN;
                        break;
                    case 53:
                        temperatureDescription.textContent = "Moderate drizzle";
                        currentIcon = Skycons.RAIN;
                        break;
                    case 55:
                        temperatureDescription.textContent = "Dense drizzle";
                        currentIcon = Skycons.RAIN;
                        break;
                    case 56:
                        temperatureDescription.textContent = "Light freezing drizzle";
                        currentIcon = Skycons.SLEET;
                        break;
                    case 57:
                        temperatureDescription.textContent = "Dense freezing drizzle";
                        currentIcon = Skycons.SLEET;
                        break;
                    case 61:
                        temperatureDescription.textContent = "Slight rain";
                        currentIcon = Skycons.RAIN;
                        break;
                    case 63:
                        temperatureDescription.textContent = "Moderate rain";
                        currentIcon = Skycons.RAIN;
                        break;
                    case 65:
                        temperatureDescription.textContent = "Heavy rain";
                        currentIcon = Skycons.RAIN;
                        break;
                    case 66:
                        temperatureDescription.textContent = "Light freezing rain";
                        currentIcon = Skycons.SLEET;
                        break;
                    case 67:
                        temperatureDescription.textContent = "Heavy freezing rain";
                        currentIcon = Skycons.SLEET;
                        break;
                    case 71:
                        temperatureDescription.textContent = "Slight snow";
                        currentIcon = Skycons.SNOW;
                        break;
                    case 73:
                        temperatureDescription.textContent = "Moderate snow";
                        currentIcon = Skycons.SNOW;
                        break;
                    case 75:
                        temperatureDescription.textContent = "Heavy snow";
                        currentIcon = Skycons.SNOW;
                        break;
                    case 77:
                        temperatureDescription.textContent = "Snow grains";
                        currentIcon = Skycons.SNOW;
                        break;
                    case 80:
                        temperatureDescription.textContent = "Slight rain showers";
                        currentIcon = Skycons.RAIN;
                        break;
                    case 81:
                        temperatureDescription.textContent = "Moderate rain showers";
                        currentIcon = Skycons.RAIN;
                        break;
                    case 82:
                        temperatureDescription.textContent = "Violent rain showers";
                        currentIcon = Skycons.RAIN;
                        break;
                    case 85:
                        temperatureDescription.textContent = "Slight snow showers";
                        currentIcon = Skycons.SNOW;
                        break;
                    case 86:
                        temperatureDescription.textContent = "Heavy snow showers";
                        currentIcon = Skycons.SNOW;
                        break;
                    case 95:
                        temperatureDescription.textContent = "Slight to moderate thunderstorm";
                        currentIcon = Skycons.RAIN;
                        break;
                    case 96:
                        temperatureDescription.textContent = "Thunderstorm with slight hail";
                        currentIcon = Skycons.RAIN;
                        break;
                    case 99:
                        temperatureDescription.textContent = "Thunderstorm with heavy hail";
                        currentIcon = Skycons.RAIN;
                        break;
                    default:
                        break;
                }
                skycons.add(iconID, currentIcon);
                skycons.play();
            }

            //Function to set hourly icons
            function setHourlyIcons(weathercode, time, i) {
                const skycons = new Skycons({ color: "white" });
                let iconID = document.querySelector(`.icon${i}`);
                let currentIcon;
                switch (weathercode) {
                    case 0:
                        if (time.substring(0, 2) > 18 || time.substring(0, 2) < 6) {
                            currentIcon = Skycons.CLEAR_NIGHT;
                        } else {
                            currentIcon = Skycons.CLEAR_DAY;
                        }
                        break;
                    case 1:
                        if (time.substring(0, 2) > 18 || time.substring(0, 2) < 6) {
                            currentIcon = Skycons.CLEAR_NIGHT;
                        } else {
                            currentIcon = Skycons.CLEAR_DAY;
                        }
                        break;
                    case 2:
                        if (time.substring(0, 2) > 18) {
                            currentIcon = Skycons.PARTLY_CLOUDY_NIGHT;
                        } else {
                            currentIcon = Skycons.PARTLY_CLOUDY_DAY;
                        }
                        break;
                    case 3:
                        currentIcon = Skycons.CLOUDY;
                        break;
                    case 45:
                        currentIcon = Skycons.FOG;
                        break;
                    case 48:
                        currentIcon = Skycons.FOG;
                        break;
                    case 51:
                        currentIcon = Skycons.RAIN;
                        break;
                    case 53:
                        currentIcon = Skycons.RAIN;
                        break;
                    case 55:
                        currentIcon = Skycons.RAIN;
                        break;
                    case 56:
                        currentIcon = Skycons.SLEET;
                        break;
                    case 57:
                        currentIcon = Skycons.SLEET;
                        break;
                    case 61:
                        currentIcon = Skycons.RAIN;
                        break;
                    case 63:
                        currentIcon = Skycons.RAIN;
                        break;
                    case 65:
                        currentIcon = Skycons.RAIN;
                        break;
                    case 66:
                        currentIcon = Skycons.SLEET;
                        break;
                    case 67:
                        currentIcon = Skycons.SLEET;
                        break;
                    case 71:
                        currentIcon = Skycons.SNOW;
                        break;
                    case 73:
                        currentIcon = Skycons.SNOW;
                        break;
                    case 75:
                        currentIcon = Skycons.SNOW;
                        break;
                    case 77:
                        currentIcon = Skycons.SNOW;
                        break;
                    case 80:
                        currentIcon = Skycons.RAIN;
                        break;
                    case 81:
                        currentIcon = Skycons.RAIN;
                        break;
                    case 82:
                        currentIcon = Skycons.RAIN;
                        break;
                    case 85:
                        currentIcon = Skycons.SNOW;
                        break;
                    case 86:
                        currentIcon = Skycons.SNOW;
                        break;
                    case 95:
                        currentIcon = Skycons.RAIN;
                        break;
                    case 96:
                        currentIcon = Skycons.RAIN;
                        break;
                    case 99:
                        currentIcon = Skycons.RAIN;
                        break;
                    default:
                        break;
                }
                skycons.add(iconID, currentIcon);
                skycons.play();
            }

            //Function to set daily icons
            function setDailyIcons(weathercode, i) {
                const skycons = new Skycons({ color: "white" });
                let iconID = document.querySelector(`.dailyIcon${i}`);
                let currentIcon;
                switch (weathercode) {
                    case 0:
                        currentIcon = Skycons.CLEAR_DAY;
                        break;
                    case 1:
                        currentIcon = Skycons.CLEAR_DAY;
                        break;
                    case 2:
                        currentIcon = Skycons.PARTLY_CLOUDY_DAY;
                        break;
                    case 3:
                        currentIcon = Skycons.CLOUDY;
                        break;
                    case 45:
                        currentIcon = Skycons.FOG;
                        break;
                    case 48:
                        currentIcon = Skycons.FOG;
                        break;
                    case 51:
                        currentIcon = Skycons.RAIN;
                        break;
                    case 53:
                        currentIcon = Skycons.RAIN;
                        break;
                    case 55:
                        currentIcon = Skycons.RAIN;
                        break;
                    case 56:
                        currentIcon = Skycons.SLEET;
                        break;
                    case 57:
                        currentIcon = Skycons.SLEET;
                        break;
                    case 61:
                        currentIcon = Skycons.RAIN;
                        break;
                    case 63:
                        currentIcon = Skycons.RAIN;
                        break;
                    case 65:
                        currentIcon = Skycons.RAIN;
                        break;
                    case 66:
                        currentIcon = Skycons.SLEET;
                        break;
                    case 67:
                        currentIcon = Skycons.SLEET;
                        break;
                    case 71:
                        currentIcon = Skycons.SNOW;
                        break;
                    case 73:
                        currentIcon = Skycons.SNOW;
                        break;
                    case 75:
                        currentIcon = Skycons.SNOW;
                        break;
                    case 77:
                        currentIcon = Skycons.SNOW;
                        break;
                    case 80:
                        currentIcon = Skycons.RAIN;
                        break;
                    case 81:
                        currentIcon = Skycons.RAIN;
                        break;
                    case 82:
                        currentIcon = Skycons.RAIN;
                        break;
                    case 85:
                        currentIcon = Skycons.SNOW;
                        break;
                    case 86:
                        currentIcon = Skycons.SNOW;
                        break;
                    case 95:
                        currentIcon = Skycons.RAIN;
                        break;
                    case 96:
                        currentIcon = Skycons.RAIN;
                        break;
                    case 99:
                        currentIcon = Skycons.RAIN;
                        break;
                    default:
                        break;
                }
                skycons.add(iconID, currentIcon);
                skycons.play();
            }
        });
    }
});