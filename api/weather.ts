import AsyncStorage from '@react-native-async-storage/async-storage';

// API key for OpenWeatherMap
const API_KEY = '89b8e8b6473fb975e482dd5973bbccab';
// Base URL for OpenWeatherMap current weather API
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export async function fetchWeather(city: string) {
  // Create a unique cache key for the city's weather data
  const cacheKey = `weather_${city.toLowerCase()}`;
  // Set cache duration to 10 minutes (in milliseconds)
  const cacheExpiry = 1000 * 60 * 10; // 10 minutes

  // Try to retrieve weather data from cache first
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Check if cached data is still valid (not expired)
      if (Date.now() - timestamp < cacheExpiry) {
        return { data, cached: true }; // Return cached data
      }
    }
  } catch (e) {
    console.log('Cache read error:', e); // Log error if cache reading fails
  }

  // If no valid cache, make an API request
  try {
    const response = await fetch(
      // Construct the API URL with city, units, and API key
      `${BASE_URL}?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
    );

    // Check if the API response is not successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => null); // Try to parse error response body
      const apiMessage = errorData?.message; // Get message from API error, if available

      // Handle specific HTTP error codes
      if (response.status === 404) {
        // City not found error
        throw new Error('City not found.\nPlease check the city name and try again.');
      }
      if (response.status === 401) {
        // Invalid API key error
        throw new Error(apiMessage || 'Invalid API key. Please check your configuration.');
      }
      if (response.status === 429) {
        // Rate limit exceeded error
        throw new Error(apiMessage || 'Rate limit exceeded. Please try again later.');
      }
      // For other errors, use the API message or a generic one
      throw new Error(apiMessage || 'Failed to fetch weather data. Please try again.');
    }

    const data = await response.json(); // Parse successful API response

    // Normalize the received API data to a more usable format
    const normalized = {
      city: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      visibility: data.visibility / 1000, // Convert meters to kilometers
      pressure: data.main.pressure
    };

    // Cache the newly fetched and normalized data
    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({ data: normalized, timestamp: Date.now() })
    );

    return { data: normalized, cached: false }; // Return fetched data
  } catch (error: any) {
    // Log and re-throw any error that occurs during API fetch or processing
    console.log('API fetch error:', error.message);
    throw error;
  }
}
