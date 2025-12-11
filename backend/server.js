import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getWeatherData } from './services/weatherService.js';
import { generateAISuggestion } from './services/aiService.js';
import { processChatMessage } from './services/chatService.js';
import { extractCityFromMessage, normalizeCityName } from './services/cityExtractor.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Weather endpoint
app.get('/api/weather', async (req, res) => {
  try {
    const { city, lat, lon } = req.query;
    
    if (!city && (!lat || !lon)) {
      return res.status(400).json({ error: 'Please provide either city name or coordinates (lat, lon)' });
    }

    const weatherData = await getWeatherData(city, lat, lon);
    res.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch weather data' });
  }
});

// Chat endpoint - main chatbot endpoint
app.post('/api/chat', async (req, res) => {
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
        // If no city extracted but message might contain a city name, try using the message itself
        // This handles cases where user just types a city name
        const trimmedMessage = message.trim();
        // Check if message looks like it might be a city name (short, no spaces, or common patterns)
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

    // Get weather data - try to fetch if we have a city or coordinates
    // But only pass it if it matches what the user asked for
    let weatherData = null;
    let weatherError = null;
    
    // Extract what city the user actually mentioned
    const userMentionedCity = extractCityFromMessage(message) || (message.trim().length < 30 ? message.trim() : null);
    
    if (cityToUse || (lat && lon)) {
      try {
        console.log(`Fetching weather for: city=${cityToUse}, lat=${lat}, lon=${lon}`);
        weatherData = await getWeatherData(cityToUse, lat, lon);
        console.log(`Weather fetched successfully for: ${weatherData?.city}`);
        
        // Only use this weather data if it matches what user asked for
        if (userMentionedCity && weatherData.city.toLowerCase() !== cityToUse?.toLowerCase()) {
          console.log(`Weather data mismatch: user asked for "${userMentionedCity}" but got "${weatherData.city}". Letting Gemini function calling handle it.`);
          weatherData = null; // Don't pass wrong weather data
        }
      } catch (error) {
        console.error('Weather fetch error:', error);
        weatherError = error.message;
        // Continue even if weather fails - let Gemini function calling try
      }
    } else {
      console.log('No city or coordinates provided, Gemini will use function calling if needed');
    }

    // Process chat message and generate AI response
    // Pass the user-mentioned city, not the extracted one, so Gemini knows what to fetch
    let response;
    try {
      response = await processChatMessage(message, weatherData, theme, userMentionedCity || cityToUse);
    } catch (error) {
      console.error('Chat processing error:', error);
      // If AI fails but we have weather data, generate a basic response
      if (weatherData) {
        response = `${weatherData.city}の現在の天気は${weatherData.description}で、気温${weatherData.temperature}°C（体感${weatherData.feelsLike}°C）です。天気に合わせた活動をお楽しみください。`;
      } else {
        // If no weather data and AI fails, return error
        throw error;
      }
    }
    
    res.json({
      response,
      weather: weatherData
    });
  } catch (error) {
    console.error('Chat API error:', error);
    // Return a user-friendly error message
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
});

// AI suggestion endpoint (standalone)
app.post('/api/suggest', async (req, res) => {
  try {
    const { prompt, weatherData } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const suggestion = await generateAISuggestion(prompt, weatherData);
    res.json({ suggestion });
  } catch (error) {
    console.error('AI suggestion error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate suggestion' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

