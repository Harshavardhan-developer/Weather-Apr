const inputEl = document.getElementById("input");
const buttonEl = document.getElementById("button");

const palceEl = document.getElementById("palce");
const todayEl = document.getElementById("today");
const temperatureEl = document.getElementById("temperature");
const feelsEl = document.getElementById("feels");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const precipitationEl = document.getElementById("precipitation");

const API_KEY = "fc1613cf2bf01c149b78e92e046e0923";

// 7-day elements
const dayElements = [
  document.getElementById("day1"),
  document.getElementById("day2"),
  document.getElementById("day3"),
  document.getElementById("day4"),
  document.getElementById("day5"),
  document.getElementById("day6"),
  document.getElementById("day7")
];

// Hourly elements
const hourlyEls = [
  document.getElementById("firstHour"),
  document.getElementById("secondHour"),
  document.getElementById("thirdHour"),
  document.getElementById("fourthHour"),
  document.getElementById("fiveHour"),
  document.getElementById("sixHour"),
  document.getElementById("sevenHour"),
  document.getElementById("eightHour")
];

const weatherIcons = {
  0: "icon-sunny.webp",
  1: "icon-partly-cloudy.webp",
  2: "icon-partly-cloudy.webp",
  3: "icon-overcast.webp",
  45: "icon-fog.webp",
  48: "icon-fog.webp",
  51: "icon-drizzle.webp",
  53: "icon-drizzle.webp",
  55: "icon-drizzle.webp",
  61: "icon-rain.webp",
  63: "icon-rain.webp",
  65: "icon-rain.webp",
  71: "icon-snow.webp",
  73: "icon-snow.webp",
  75: "icon-snow.webp",
  95: "icon-storm.webp",
  96: "icon-storm.webp"
};

const weatherCodes = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  95: "Thunderstorm",
  96: "Thunderstorm with hail"
};

buttonEl.addEventListener("click", () => {
  const place = inputEl.value.trim();

  if (!place) {
    palceEl.textContent = "Please enter a place!";
    return;
  }

  const weatherApiUrl =
    `https://api.openweathermap.org/data/2.5/weather?q=${place}&appid=${API_KEY}&units=metric`;

  fetch(weatherApiUrl)
    .then(res => res.json())
    .then(data => {

      if (data.cod !== 200) {
        palceEl.textContent = "Place not found!";
        return;
      }

      // Current weather
      palceEl.textContent = `${data.name}, ${data.sys.country}`;
      todayEl.textContent = new Date().toLocaleDateString();
      temperatureEl.textContent = `${data.main.temp}°C`;
      feelsEl.textContent = `${data.main.feels_like}°C`;
      humidityEl.textContent = `${data.main.humidity}%`;
      windEl.textContent = `${data.wind.speed} m/s`;
      precipitationEl.textContent = data.rain?.["1h"] ? `${data.rain["1h"]} mm` : "0 mm";

      // Get lat/lon
      const lat = data.coord.lat;
      const lon = data.coord.lon;

      // Combined API (daily + hourly)
      const forecastURL =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

      return fetch(forecastURL);
    })
    .then(res => res.json())
    .then(forecast => {

      /* ------------------------------------
         7–DAY FORECAST
      --------------------------------------*/
      for (let i = 0; i < 7; i++) {
        const date = new Date(forecast.daily.time[i]);
        const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

        const temp = forecast.daily.temperature_2m_max[i];
        const code = forecast.daily.weathercode[i];
        const icon = weatherIcons[code] || "icon-sunny.webp";
        const desc = weatherCodes[code] || "Unknown";

        dayElements[i].innerHTML = `
          <img src="./images/${icon}" class="daily-icon" alt="${desc}">
          <h3 class="dayName pt-2">${dayName}</h3>
          <p>${temp}°C</p>
        `;
      }

      /* ------------------------------------
         8–HOUR FORECAST
      --------------------------------------*/
      const hourlyTimes = forecast.hourly.time;
      const hourlyTemps = forecast.hourly.temperature_2m;
      const hourlyCodes = forecast.hourly.weathercode;

      for (let i = 0; i < 8; i++) {
        const date = new Date(hourlyTimes[i]);
        const hour = date.toLocaleTimeString("en-US", {
          hour: "numeric",
          hour12: true
        });

        const temp = hourlyTemps[i];
        const code = hourlyCodes[i];
        const icon = weatherIcons[code] || "icon-sunny.webp";
        const desc = weatherCodes[code] || "Unknown";

        hourlyEls[i].innerHTML = `
          <img src="./images/${icon}" class="hour-icon mt-1" alt="${desc}">
          <p class="hour-time fs-6">${hour}</p>
          <p class="hour-temp ms-auto p-3">${temp}°C</p>
        `;
      }
    })
    .catch(err => console.error("Error:", err));
});
