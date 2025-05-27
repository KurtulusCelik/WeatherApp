import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = '89b8e8b6473fb975e482dd5973bbccab';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export async function fetchWeather(city: string) {
  const cacheKey = `weather_${city.toLowerCase()}`;
  const cacheExpiry = 1000 * 60 * 10; // 10 minutes

  // Check cache
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < cacheExpiry) {
        return { data, cached: true };
      }
    }
  } catch (e) {
    console.log('Cache read error:', e);
  }

  // Make API request
  try {
    const response = await fetch(
      `${BASE_URL}?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error('Failed to fetch weather data.');
    }

    const data = await response.json();

    // Normalize
    const normalized = {
      city: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      visibility: data.visibility / 1000,
      pressure: data.main.pressure
    };

    // Cache it
    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({ data: normalized, timestamp: Date.now() })
    );

    return { data: normalized, cached: false };
  } catch (error: any) {
    console.log('API fetch error:', error.message);
    throw error;
  }
}
