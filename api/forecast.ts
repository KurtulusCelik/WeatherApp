import AsyncStorage from '@react-native-async-storage/async-storage';

// API key for OpenWeatherMap
const API_KEY = '89b8e8b6473fb975e482dd5973bbccab';
// Base URL for OpenWeatherMap 5-day forecast API
const BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// Defines the structure for a single forecast item after processing
type ForecastItem = {
  date: string; // Date in YYYY-MM-DD format
  min: number;  // Minimum temperature for the day
  max: number;  // Maximum temperature for the day
  condition: string; // General weather condition (e.g., Clouds, Rain)
};

export async function fetchForecast(city: string): Promise<ForecastItem[]> {
  // Create a unique cache key for the city's forecast data
  const cacheKey = `forecast_${city.toLowerCase()}`;
  // Set cache duration to 10 minutes (in milliseconds)
  const cacheExpiry = 1000 * 60 * 10; // 10 minutes

  // Try to retrieve forecast data from cache first
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Check if cached data is still valid (not expired)
      if (Date.now() - timestamp < cacheExpiry) {
        return data; // Return cached forecast data
      }
    }
  } catch (e) {
    console.log('Forecast cache read error:', e); // Log error if cache reading fails
  }

  // If no valid cache, make an API request
  let response;
  try {
    // Fetch 5-day forecast data (which comes in 3-hour intervals, so 40 items)
    response = await fetch(`${BASE_URL}?q=${encodeURIComponent(city)}&units=metric&cnt=40&appid=${API_KEY}`);
    // Check if the API response is not successful
    if (!response.ok) {
      if (response.status === 429) {
        // Handle rate limit error specifically for forecast
        throw new Error('Forecast rate limit exceeded. Try again later.');
      }
      // Generic error for other failed forecast fetches
      throw new Error('Failed to fetch forecast data.');
    }
  } catch (error) {
    // Log and re-throw any error during the fetch operation
    console.log('Forecast fetch error:', error);
    throw error;
  }

  const data = await response.json(); // Parse successful API response

  // Process and normalize the forecast data
  // The API returns data in 3-hour intervals, so we group them by day
  const grouped: Record<string, ForecastItem> = {};

  for (const item of data.list) {
    const date = item.dt_txt.split(' ')[0]; // Extract YYYY-MM-DD from 'YYYY-MM-DD HH:MM:SS'
    const tempMin = Math.round(item.main.temp_min);
    const tempMax = Math.round(item.main.temp_max);
    const weather = item.weather[0]; // Main weather condition for this interval

    // If this date is not yet in our `grouped` object, add it
    if (!grouped[date]) {
      grouped[date] = {
        date,
        min: tempMin,
        max: tempMax,
        condition: weather.main,
      };
    } else {
      // If date exists, update min and max temperatures for that day
      grouped[date].min = Math.min(grouped[date].min, tempMin);
      grouped[date].max = Math.max(grouped[date].max, tempMax);
      // Note: Condition for the day will be from the first interval processed for that day.
      // More complex logic could be used to determine a representative condition if needed.
    }
  }

  // Exclude today's forecast data and limit to the next 5 days
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  const result = Object.values(grouped)
    .filter(item => item.date !== today) // Remove today's data
    .slice(0, 5); // Get the next 5 days
  
  // Cache the processed forecast data
  try {
    await AsyncStorage.setItem(cacheKey, JSON.stringify({ data: result, timestamp: Date.now() }));
  } catch (e) {
    console.log('Forecast cache write error:', e);
  }

  return result;
}

