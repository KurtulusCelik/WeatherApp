import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = '89b8e8b6473fb975e482dd5973bbccab';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';

type ForecastItem = {
  date: string;
  min: number;
  max: number;
  condition: string;
};

export async function fetchForecast(city: string): Promise<ForecastItem[]> {

  const cacheKey = `forecast_${city.toLowerCase()}`;
  const cacheExpiry = 1000 * 60 * 10; // 10 minutes


  // Check cache
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < cacheExpiry) {
        return data;
      }
    }
  } catch (e) {
    console.log('Forecast cache read error:', e);
  }

  // Make API request
  let response;
  try {
    response = await fetch(`${BASE_URL}?q=${encodeURIComponent(city)}&units=metric&cnt=40&appid=${API_KEY}`);
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Forecast rate limit exceeded. Try again later.');
      }
      throw new Error('Failed to fetch forecast data.');
    }
  } catch (error) {
    console.log('Forecast fetch error:', error);
    throw error;
  }

  const data = await response.json();

  // Normalize
  const grouped: Record<string, ForecastItem> = {};

  for (const item of data.list) {
    const date = item.dt_txt.split(' ')[0]; // YYYY-MM-DD
    const tempMin = Math.round(item.main.temp_min);
    const tempMax = Math.round(item.main.temp_max);
    const weather = item.weather[0];

    if (!grouped[date]) {
      grouped[date] = {
        date,
        min: tempMin,
        max: tempMax,
        condition: weather.main,
      };
    } else {
      grouped[date].min = Math.min(grouped[date].min, tempMin);
      grouped[date].max = Math.max(grouped[date].max, tempMax);
    }
  }

  // exclude today
  const today = new Date().toISOString().split('T')[0];
  const result = Object.values(grouped).filter(item => item.date !== today).slice(0, 5);
  return result;
}
