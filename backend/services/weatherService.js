import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Mapping of Japanese city names to English names for better API compatibility
const cityNameMap = {
  '東京': 'Tokyo',
  '大阪': 'Osaka',
  '京都': 'Kyoto',
  '横浜': 'Yokohama',
  '札幌': 'Sapporo',
  '福岡': 'Fukuoka',
  '広島': 'Hiroshima',
  '仙台': 'Sendai',
  '名古屋': 'Nagoya',
  '神戸': 'Kobe',
  '千葉': 'Chiba',
  '埼玉': 'Saitama',
  '新潟': 'Niigata',
  '静岡': 'Shizuoka',
  '岡山': 'Okayama',
  '熊本': 'Kumamoto',
  '鹿児島': 'Kagoshima',
  '長崎': 'Nagasaki',
  '青森': 'Aomori',
  '盛岡': 'Morioka',
  // Add lowercase variants
  'tokyo': 'Tokyo',
  'osaka': 'Osaka',
  'kyoto': 'Kyoto',
  'yokohama': 'Yokohama',
  'sapporo': 'Sapporo',
  'fukuoka': 'Fukuoka',
  'hiroshima': 'Hiroshima',
  'sendai': 'Sendai',
  'nagoya': 'Nagoya',
  'kobe': 'Kobe',
  'chiba': 'Chiba',
  'saitama': 'Saitama',
  'niigata': 'Niigata',
  'shizuoka': 'Shizuoka',
  'okayama': 'Okayama',
  'kumamoto': 'Kumamoto',
  'kagoshima': 'Kagoshima',
  'nagasaki': 'Nagasaki',
  'aomori': 'Aomori',
  'morioka': 'Morioka'
};

export async function getWeatherData(city, lat, lon) {
  try {
    let url;
    
    if (city) {
      // Map Japanese city names to English if available
      const cityKey = city.trim();
      // Try exact match first, then lowercase, then original
      let cityName = cityNameMap[cityKey];
      if (!cityName) {
        cityName = cityNameMap[cityKey.toLowerCase()];
      }
      if (!cityName) {
        cityName = cityKey; // Use original if no mapping found - API will try to find it
      }
      const cityEncoded = encodeURIComponent(cityName);
      console.log(`Weather lookup: ${cityKey} -> ${cityName}`);
      
      // Try multiple strategies to find the city
      const strategies = [
        // Strategy 1: With country code JP (for Japanese cities)
        `${cityEncoded},JP`,
        // Strategy 2: Without country code (works for international cities)
        cityEncoded,
        // Strategy 3: Try with "Japan" for Japanese cities
        `${cityEncoded},Japan`
      ];
      
      let lastError = null;
      for (const strategy of strategies) {
        url = `${BASE_URL}/weather?q=${strategy}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=ja`;
        try {
          const response = await axios.get(url);
          const data = response.data;
          console.log(`Weather found using strategy: ${strategy}`);
          return formatWeatherData(data);
        } catch (error) {
          lastError = error;
          // If it's not a 404, don't try other strategies
          if (error.response && error.response.status !== 404) {
            throw error;
          }
          // Continue to next strategy
          continue;
        }
      }
      
      // If all strategies failed
      if (lastError && lastError.response && lastError.response.status === 404) {
        throw new Error(`City "${cityKey}" not found. Please check the city name.`);
      }
      throw lastError || new Error('Failed to fetch weather data');
    } else if (lat && lon) {
      url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=ja`;
      const response = await axios.get(url);
      const data = response.data;
      return formatWeatherData(data);
    } else {
      throw new Error('Either city name or coordinates must be provided');
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('City not found. Please check the city name.');
      }
      throw new Error(`Weather API error: ${error.response.data.message || 'Unknown error'}`);
    }
    throw error;
  }
}

function formatWeatherData(data) {
  return {
    city: data.name,
    country: data.sys.country,
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    description: data.weather[0].description,
    main: data.weather[0].main,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    icon: data.weather[0].icon,
    coordinates: {
      lat: data.coord.lat,
      lon: data.coord.lon
    }
  };
}

