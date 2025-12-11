import { generateAISuggestion } from './aiService.js';
import { extractCityFromMessage } from './cityExtractor.js';

export async function processChatMessage(userMessage, weatherData = null, theme = 'general', requestedCity = null) {
  try {
    // Extract requested city from message if not provided
    const cityInMessage = requestedCity || extractCityFromMessage(userMessage);
    
    // Generate AI response based on user message, weather data, theme, and requested city
    const aiResponse = await generateAISuggestion(userMessage, weatherData, theme, cityInMessage);
    return aiResponse;
  } catch (error) {
    console.error('Chat processing error:', error);
    throw error;
  }
}

