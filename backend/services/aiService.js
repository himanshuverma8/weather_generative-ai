import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { getWeatherData } from './weatherService.js';
import { extractCityFromMessage } from './cityExtractor.js';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const themeContexts = {
  travel: '旅行・観光に関する提案をしてください。天気を考慮した観光スポット、アクティビティ、旅行のヒントを提供してください。',
  outings: 'お出かけ・外出に関する提案をしてください。天気に適した外出先、アクティビティ、イベント情報を提供してください。',
  fashion: 'ファッション・服装に関する提案をしてください。天気に適した服装、スタイリング、アクセサリーの提案をしてください。',
  music: '音楽・エンターテイメントに関する提案をしてください。天気に合った音楽、コンサート、音楽イベントの提案をしてください。',
  agriculture: '農業・ガーデニングに関する提案をしてください。天気を考慮した農作業、ガーデニング、植物のケアに関する提案をしてください。',
  sports: 'スポーツ・運動に関する提案をしてください。天気に適したスポーツ、運動、フィットネス活動の提案をしてください。',
  food: 'グルメ・食事に関する提案をしてください。天気に合った料理、レストラン、食材、レシピの提案をしてください。',
  general: '一般的な提案をしてください。天気を考慮した様々な活動やアドバイスを提供してください。'
};

// Function definition for weather API
const weatherFunction = {
  name: 'get_weather',
  description: 'Get current weather information for any city in the world. Use this function when the user asks about weather for a specific city, or when you need weather information to provide recommendations.',
  parameters: {
    type: 'object',
    properties: {
      city: {
        type: 'string',
        description: 'The name of the city (can be in Japanese or English). Examples: "Tokyo", "東京", "Sapporo", "札幌", "Osaka", "大阪"'
      }
    },
    required: ['city']
  }
};

// Function to execute weather API call
async function executeWeatherFunction(city) {
  try {
    console.log(`Executing weather function for city: ${city}`);
    const weatherData = await getWeatherData(city, null, null);
    return {
      success: true,
      data: {
        city: weatherData.city,
        country: weatherData.country,
        temperature: weatherData.temperature,
        feelsLike: weatherData.feelsLike,
        description: weatherData.description,
        main: weatherData.main,
        humidity: weatherData.humidity,
        windSpeed: weatherData.windSpeed
      }
    };
  } catch (error) {
    console.error(`Weather function error for ${city}:`, error);
    return {
      success: false,
      error: error.message || 'Failed to fetch weather data'
    };
  }
}

export async function generateAISuggestion(userMessage, weatherData = null, theme = 'general', requestedCity = null) {
  try {
    const themeContext = themeContexts[theme] || themeContexts.general;

    // Extract city from message if not provided
    // If message is short and looks like a city name, use it directly
    const trimmedMessage = userMessage.trim();
    const messageIsLikelyCity = trimmedMessage.length < 30 && 
                                 !trimmedMessage.includes(' ') && 
                                 !trimmedMessage.toLowerCase().includes('weather') &&
                                 !trimmedMessage.includes('天気');
    
    const cityInMessage = requestedCity || 
                         extractCityFromMessage(userMessage) || 
                         (messageIsLikelyCity ? trimmedMessage : null);
    
    // ALWAYS fetch weather if we detect a city and don't have matching weather data
    let finalWeatherData = weatherData;
    if (cityInMessage && (!weatherData || weatherData.city.toLowerCase() !== cityInMessage.toLowerCase())) {
      console.log(`City "${cityInMessage}" detected, fetching weather...`);
      try {
        const weatherResult = await executeWeatherFunction(cityInMessage);
        if (weatherResult.success) {
          finalWeatherData = {
            city: weatherResult.data.city,
            country: weatherResult.data.country,
            temperature: weatherResult.data.temperature,
            feelsLike: weatherResult.data.feelsLike,
            description: weatherResult.data.description,
            main: weatherResult.data.main,
            humidity: weatherResult.data.humidity,
            windSpeed: weatherResult.data.windSpeed
          };
          console.log(`Weather fetched for ${finalWeatherData.city}`);
        }
      } catch (error) {
        console.error(`Failed to fetch weather for ${cityInMessage}:`, error);
      }
    }
    
    // Now use Gemini with function calling as backup, but we already have the weather
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      tools: [{ functionDeclarations: [weatherFunction] }]
    });
    
    // Build initial prompt with weather data if available
    let systemPrompt = `あなたは親切で知識豊富な日本のAIアシスタントです。ユーザーの質問や要望に対して、選択されたテーマ（${theme}）に基づき、天気情報を考慮しながら、実用的で役立つ提案を日本語で提供してください。

テーマの焦点: ${themeContext}

ユーザーのメッセージ: ${userMessage}`;

    // Include weather data if we have it
    if (finalWeatherData) {
      systemPrompt += `\n\n現在の天気情報:
- 場所: ${finalWeatherData.city}, ${finalWeatherData.country}
- 気温: ${finalWeatherData.temperature}°C
- 体感温度: ${finalWeatherData.feelsLike}°C
- 天気: ${finalWeatherData.description}
- 湿度: ${finalWeatherData.humidity}%
- 風速: ${finalWeatherData.windSpeed}m/s

上記の天気情報を基に、選択されたテーマに沿って、ユーザーに対して親切で実用的な回答を日本語で提供してください。`;
    } else if (cityInMessage) {
      // If we detected a city but couldn't fetch weather, tell Gemini to try
      systemPrompt += `\n\n重要: ユーザーは「${cityInMessage}」について尋ねています。get_weather関数を使用して「${cityInMessage}」の最新の天気情報を取得してください。`;
    }

    systemPrompt += `\n\n**重要: 以下のJSON形式で回答してください:**
\`\`\`json
{
  "greeting": "挨拶文（1文）",
  "weather_summary": "天気の要約（天気情報がある場合のみ）",
  "main_suggestion": "メインの提案や回答（2-3文）",
  "recommendations": [
    {"icon": "絵文字", "title": "タイトル", "description": "説明"},
    {"icon": "絵文字", "title": "タイトル", "description": "説明"}
  ],
  "tips": ["ヒント1", "ヒント2"],
  "closing": "締めの言葉（1文）"
}
\`\`\`

注意:
- greeting, main_suggestion, closingは必須です
- weather_summaryは天気情報がある場合のみ含めてください
- recommendationsは1-3個で、テーマに関連したおすすめを含めてください
- tipsは0-2個で、役立つヒントがあれば含めてください
- すべて日本語で、親しみやすい言葉遣いで書いてください`;

    // Start chat with function calling
    const chat = model.startChat({
      tools: [{ functionDeclarations: [weatherFunction] }]
    });

    let result = await chat.sendMessage(systemPrompt);
    let response = result.response;

    // Handle function calls if Gemini decides to call them (backup)
    // But we've already fetched weather, so this is just for edge cases
    let maxIterations = 3; // Prevent infinite loops
    
    while (maxIterations > 0) {
      maxIterations--;
      
      // Check if response has function calls
      const functionCalls = response.functionCalls ? response.functionCalls() : null;
      
      if (!functionCalls || functionCalls.length === 0) {
        // No function calls, we're done
        break;
      }
      
      // Handle function calls (backup case)
      const functionResponses = [];
      for (const functionCall of functionCalls) {
        if (functionCall.name === 'get_weather') {
          const city = functionCall.args.city;
          console.log(`AI requested weather for: ${city} (backup call)`);
          const weatherResult = await executeWeatherFunction(city);
          
          if (weatherResult.success) {
            functionResponses.push({
              functionResponse: {
                name: 'get_weather',
                response: {
                  city: weatherResult.data.city,
                  country: weatherResult.data.country,
                  temperature: weatherResult.data.temperature,
                  feelsLike: weatherResult.data.feelsLike,
                  description: weatherResult.data.description,
                  main: weatherResult.data.main,
                  humidity: weatherResult.data.humidity,
                  windSpeed: weatherResult.data.windSpeed,
                  message: `${weatherResult.data.city}の現在の天気: 気温${weatherResult.data.temperature}°C、体感${weatherResult.data.feelsLike}°C、${weatherResult.data.description}、湿度${weatherResult.data.humidity}%、風速${weatherResult.data.windSpeed}m/s`
                }
              }
            });
          } else {
            functionResponses.push({
              functionResponse: {
                name: 'get_weather',
                response: {
                  error: weatherResult.error,
                  message: `${city}の天気情報を取得できませんでした: ${weatherResult.error}`
                }
              }
            });
          }
        }
      }

      // Send function responses back to the model
      if (functionResponses.length > 0) {
        result = await chat.sendMessage(functionResponses);
        response = result.response;
      } else {
        break;
      }
    }

    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Handle quota exceeded errors with retry logic
    if (error.message && error.message.includes('429') && error.message.includes('quota')) {
      // Extract retry delay from error if available
      const retryMatch = error.message.match(/retry in ([\d.]+)s/i);
      const retryDelay = retryMatch ? parseFloat(retryMatch[1]) * 1000 : 60000; // Default 60 seconds
      
      console.log(`Quota exceeded, waiting ${retryDelay/1000}s before retry...`);
      
      // Wait and retry once
      await new Promise(resolve => setTimeout(resolve, Math.min(retryDelay, 60000)));
      
      try {
        // Retry with a simpler model or approach
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const simplePrompt = `ユーザーのメッセージ: ${userMessage}
        
${finalWeatherData ? `現在の天気情報:
- 場所: ${finalWeatherData.city}, ${finalWeatherData.country}
- 気温: ${finalWeatherData.temperature}°C
- 体感温度: ${finalWeatherData.feelsLike}°C
- 天気: ${finalWeatherData.description}
- 湿度: ${finalWeatherData.humidity}%
- 風速: ${finalWeatherData.windSpeed}m/s` : ''}

テーマ: ${themeContext}

上記の情報を基に、選択されたテーマに沿って、ユーザーに対して親切で実用的な回答を日本語で200文字以内で提供してください。`;
        
        const result = await model.generateContent(simplePrompt);
        return result.response.text();
      } catch (retryError) {
        // If retry also fails, return a helpful message with weather info if available
        if (finalWeatherData) {
          return generateFallbackResponse(userMessage, finalWeatherData, theme, themeContext);
        }
        throw new Error('API quota exceeded. Please try again later or check your Gemini API quota.');
      }
    }
    
    // If we have weather data, generate a fallback response
    if (finalWeatherData) {
      return generateFallbackResponse(userMessage, finalWeatherData, theme, themeContext);
    }
    
    // Final fallback
    throw new Error(`AI generation failed: ${error.message}`);
  }
}

// Fallback response generator when AI is unavailable
function generateFallbackResponse(userMessage, weatherData, theme, themeContext) {
  const city = weatherData.city;
  const temp = weatherData.temperature;
  const feelsLike = weatherData.feelsLike;
  const description = weatherData.description;
  
  let recommendations = [];
  let tips = [];
  let mainSuggestion = '';
  
  if (theme === 'travel' || theme === 'outings') {
    if (temp < 10) {
      mainSuggestion = '寒い日なので、屋内の観光スポットや温かいカフェでのんびり過ごすのがおすすめです。';
      recommendations = [
        { icon: '🏛️', title: '美術館・博物館', description: '文化的なひとときを' },
        { icon: '☕', title: 'カフェ巡り', description: '温かい飲み物でほっこり' }
      ];
      tips = ['防寒対策をしっかりと'];
    } else if (temp < 20) {
      mainSuggestion = '過ごしやすい気温です。散策や観光に最適な日ですね。';
      recommendations = [
        { icon: '🚶', title: '街歩き', description: '散策を楽しむのに最適' },
        { icon: '🌳', title: '公園散歩', description: '自然を感じながらリフレッシュ' }
      ];
    } else {
      mainSuggestion = '暖かい日なので、屋外でのアクティビティを楽しめます。';
      recommendations = [
        { icon: '🌸', title: '屋外観光', description: 'お天気を満喫' },
        { icon: '🍦', title: 'スイーツ', description: '冷たいデザートも美味しい' }
      ];
      tips = ['水分補給を忘れずに'];
    }
  } else if (theme === 'fashion') {
    if (temp < 10) {
      mainSuggestion = 'コートやダウンジャケットなど、しっかりとした防寒対策が必要です。';
      recommendations = [
        { icon: '🧥', title: 'コート', description: '暖かいアウターを' },
        { icon: '🧣', title: 'マフラー', description: '首元の防寒も大切' }
      ];
    } else if (temp < 20) {
      mainSuggestion = 'カーディガンやライトジャケットがあると安心です。';
      recommendations = [
        { icon: '👔', title: 'ライトアウター', description: '温度調節しやすい服装' }
      ];
    } else {
      mainSuggestion = '軽装で快適に過ごせます。';
      recommendations = [
        { icon: '👕', title: '軽装', description: '涼しい服装で' }
      ];
    }
  } else if (theme === 'food') {
    if (temp < 10) {
      mainSuggestion = '温かい鍋料理やスープ、ラーメンなどがおすすめです。';
      recommendations = [
        { icon: '🍜', title: 'ラーメン', description: '体を温めて' },
        { icon: '🍲', title: '鍋料理', description: '温かいお鍋で' }
      ];
    } else {
      mainSuggestion = '季節の食材を楽しめる料理がおすすめです。';
      recommendations = [
        { icon: '🍱', title: '季節料理', description: '旬の食材を堪能' }
      ];
    }
  } else {
    mainSuggestion = '天気に合わせた活動を楽しんでください。';
  }
  
  const response = {
    greeting: `こんにちは！${city}の天気についてお答えします。`,
    weather_summary: `現在${temp}°C（体感${feelsLike}°C）、${description}です。`,
    main_suggestion: mainSuggestion,
    recommendations: recommendations,
    tips: tips,
    closing: '素敵な一日をお過ごしください！🌸'
  };
  
  return '```json\n' + JSON.stringify(response, null, 2) + '\n```';
}

