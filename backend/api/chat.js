import { getWeatherData } from '../services/weatherService.js';
import { processChatMessage } from '../services/chatService.js';
import { extractCityFromMessage, normalizeCityName } from '../services/cityExtractor.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, city, lat, lon, theme } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Extract city name from message if not provided
    let cityToUse = city;
    if (!cityToUse && !lat && !lon) {
      const extractedCity = extractCityFromMessage(message);
      if (extractedCity) {
        cityToUse = normalizeCityName(extractedCity);
        console.log(`Extracted city from message: "${message}" -> ${extractedCity} -> ${cityToUse}`);
      } else {
        const trimmedMessage = message.trim();
        if (trimmedMessage.length < 20 && !trimmedMessage.includes(' ')) {
          console.log(`Message might be a city name, trying: "${trimmedMessage}"`);
          cityToUse = normalizeCityName(trimmedMessage);
        } else {
          console.log(`No city extracted from message: "${message}"`);
        }
      }
    } else if (cityToUse) {
      cityToUse = normalizeCityName(cityToUse);
      console.log(`Using provided city: ${city} -> ${cityToUse}`);
    }

    // Get weather data
    let weatherData = null;
    const userMentionedCity = extractCityFromMessage(message) || (message.trim().length < 30 ? message.trim() : null);
    
    if (cityToUse || (lat && lon)) {
      try {
        console.log(`Fetching weather for: city=${cityToUse}, lat=${lat}, lon=${lon}`);
        weatherData = await getWeatherData(cityToUse, lat, lon);
        console.log(`Weather fetched successfully for: ${weatherData?.city}`);
        
        if (userMentionedCity && weatherData.city.toLowerCase() !== cityToUse?.toLowerCase()) {
          console.log(`Weather data mismatch: user asked for "${userMentionedCity}" but got "${weatherData.city}". Letting Gemini function calling handle it.`);
          weatherData = null;
        }
      } catch (error) {
        console.error('Weather fetch error:', error);
      }
    }

    // Process chat message and generate AI response
    let response;
    try {
      response = await processChatMessage(message, weatherData, theme, userMentionedCity || cityToUse);
    } catch (error) {
      console.error('Chat processing error:', error);
      if (weatherData) {
        response = `${weatherData.city}の現在の天気は${weatherData.description}で、気温${weatherData.temperature}°C（体感${weatherData.feelsLike}°C）です。天気に合わせた活動をお楽しみください。`;
      } else {
        throw error;
      }
    }
    
    res.json({
      response,
      weather: weatherData
    });
  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error.message || 'Failed to process chat message';
    let userFriendlyError = '申し訳ございませんが、エラーが発生しました。もう一度お試しください。';
    
    if (errorMessage.includes('quota') || errorMessage.includes('429')) {
      userFriendlyError = 'APIの利用制限に達しました。しばらく時間をおいてから再度お試しください。';
    }
    
    res.status(500).json({ 
      error: userFriendlyError,
      details: errorMessage 
    });
  }
}

