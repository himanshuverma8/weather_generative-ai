# 天気AIチャットボット (Weather AI Chatbot)

A chatbot that combines weather data with generative AI to provide intelligent suggestions. Features Japanese voice input, weather retrieval, and AI-powered recommendations with a beautiful Japanese-themed UI.

## Preview

![Chat Interface](https://res.cloudinary.com/de5vcnanx/image/upload/v1765443381/Screenshot_2025-12-11_at_2.24.22_PM_fqjagv.png)

![AI Response](https://res.cloudinary.com/de5vcnanx/image/upload/v1765443381/Screenshot_2025-12-11_at_2.24.33_PM_lbdx4q.png)

## Features

- 🌤️ **Weather Integration**: Real-time weather data from OpenWeatherMap API
- 🎤 **Japanese Voice Input**: Speech recognition for Japanese language
- 🤖 **AI-Powered Suggestions**: Gemini AI (gemini-2.5-flash) generates contextual recommendations
- 🎨 **Theme Selection**: Choose from travel, fashion, food, activities, or general themes
- 💬 **Chat Interface**: Modern, Japanese-themed chat UI with sakura aesthetics
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🏙️ **Smart City Detection**: Automatically extracts city names from messages (supports Japanese districts)

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **APIs**: 
  - OpenWeatherMap (Weather data)
  - Google Gemini AI (Generative AI)

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
OPENWEATHER_API_KEY=your_openweather_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
```

4. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

1. Open the application in your browser
2. Allow location access to get weather for your current location (optional)
3. Use the voice input button to speak in Japanese, or type your message
4. The AI will provide suggestions based on the current weather conditions

### Example Queries (in Japanese)

- "今日の天気に合った服装を教えて" (Tell me what to wear for today's weather)
- "雨の日におすすめのアクティビティは？" (What activities do you recommend for a rainy day?)
- "東京の天気を教えて" (Tell me Tokyo's weather)
- "札幌" or "Sapporo" (Just type a city name to get weather info)
- "渋谷でおすすめのレストランは？" (Recommended restaurants in Shibuya?)

## Project Structure

```
assignment_jp/
├── backend/
│   ├── services/
│   │   ├── weatherService.js    # OpenWeatherMap API integration
│   │   ├── aiService.js         # Gemini AI integration (with function calling)
│   │   ├── chatService.js       # Chat processing logic
│   │   └── cityExtractor.js     # City name extraction from messages
│   ├── server.js                # Express server
│   ├── package.json
│   └── .env                     # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── VoiceInput.jsx   # Voice and text input component
│   │   │   ├── ChatMessage.jsx  # Chat message display component
│   │   │   └── ThemeSelector.jsx # Theme selection component
│   │   ├── App.jsx              # Main app component
│   │   ├── App.css              # Japanese-themed styles
│   │   ├── index.css            # Global styles with Noto fonts
│   │   └── main.jsx             # Entry point
│   └── package.json
└── README.md
```

## API Endpoints

### GET `/api/weather`
Get weather data for a city or coordinates.

**Query Parameters:**
- `city` (optional): City name
- `lat` (optional): Latitude
- `lon` (optional): Longitude

### POST `/api/chat`
Main chatbot endpoint that combines weather and AI.

**Request Body:**
```json
{
  "message": "今日の天気に合った服装を教えて",
  "city": "Tokyo",
  "lat": 35.6762,
  "lon": 139.6503,
  "theme": "fashion"
}
```

**Parameters:**
- `message` (required): User's message in Japanese or English
- `city` (optional): City name - auto-extracted from message if not provided
- `lat`, `lon` (optional): Coordinates for weather lookup
- `theme` (optional): One of "general", "travel", "fashion", "food", "activities"

**Response:**
```json
{
  "response": "AI generated response with weather-based suggestions...",
  "weather": {
    "city": "Tokyo",
    "temperature": 18,
    "description": "曇り",
    "humidity": 65,
    "windSpeed": 3.5
  }
}
```

### POST `/api/suggest`
Generate AI suggestions (standalone).

**Request Body:**
```json
{
  "prompt": "What should I do today?",
  "weatherData": { ... }
}
```

## Browser Compatibility

- Chrome/Edge: Full support (including voice input)
- Firefox: Full support (including voice input)
- Safari: Full support (including voice input)

**Note**: Voice input requires microphone permissions and works best in Chrome/Edge.

## License

This project is created for assignment purposes.

