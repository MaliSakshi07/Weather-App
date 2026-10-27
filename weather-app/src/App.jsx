
import { useState } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function getWeather(e) {
    e.preventDefault();

    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      // Step 1: Find city coordinates
      const geoUrl =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.trim())}&count=1&language=en&format=json`;

      const geoResponse = await fetch(geoUrl);
      if (!geoResponse.ok) throw new Error("Unable to find city.");

      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found. Try another city.");
      }

      const place = geoData.results[0];

      // Step 2: Get current weather
      const weatherUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&timezone=auto`;

      const weatherResponse = await fetch(weatherUrl);
      if (!weatherResponse.ok) {
        throw new Error("Unable to fetch weather.");
      }

      const weatherData = await weatherResponse.json();

      setWeather({
        name: place.name,
        country: place.country || "",
        ...weatherData.current,
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function getCondition(code) {
    if (code === 0) return ["☀️", "Clear sky"];
    if ([1, 2].includes(code)) return ["🌤️", "Partly cloudy"];
    if (code === 3) return ["☁️", "Overcast"];
    if ([45, 48].includes(code)) return ["🌫️", "Foggy"];
    if ([51, 53, 55, 56, 57].includes(code))
      return ["🌦️", "Drizzle"];
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code))
      return ["🌧️", "Rainy"];
    if ([71, 73, 75, 77, 85, 86].includes(code))
      return ["❄️", "Snowy"];
    if ([95, 96, 99].includes(code))
      return ["⛈️", "Thunderstorm"];

    return ["🌡️", "Weather information"];
  }

  return (
    <div className="app">
      <div className="weather-card">
        <h1>🌦️ Weather App</h1>
        <p className="subtitle">
          Check the weather in any city
        </p>

        <form onSubmit={getWeather} className="search-form">
          <input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Search"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {weather && (
          <div className="weather-info">
            <h2>
              {weather.name}, {weather.country}
            </h2>

            <div className="weather-icon">
              {getCondition(weather.weather_code)[0]}
            </div>

            <h3 className="temperature">
              {Math.round(weather.temperature_2m)}°C
            </h3>

            <p className="condition">
              {getCondition(weather.weather_code)[1]}
            </p>

            <div className="details">
              <div className="detail-box">
                <span>🌡️</span>
                <p>Feels Like</p>
                <strong>
                  {Math.round(weather.apparent_temperature)}°C
                </strong>
              </div>

              <div className="detail-box">
                <span>💧</span>
                <p>Humidity</p>
                <strong>
                  {weather.relative_humidity_2m}%
                </strong>
              </div>

              <div className="detail-box">
                <span>💨</span>
                <p>Wind Speed</p>
                <strong>
                  {weather.wind_speed_10m} km/h
                </strong>
              </div>
            </div>
          </div>
        )}

        {!weather && !error && !loading && (
          <p className="hint">
            Try Pune, Mumbai, Delhi or London
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
