# Quick Setup Guide

## Step 1: Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create `.env` file with the following content:
```env
OPENWEATHER_API_KEY=your_openweather_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
```

3. Install dependencies:
```bash
npm install
```

4. Start the server:
```bash
npm start
```

The backend should now be running on `http://localhost:3001`

## Step 2: Frontend Setup

1. Open a new terminal and navigate to frontend directory:
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

The frontend should now be running on `http://localhost:5173`

## Step 3: Test the Application

1. Open your browser and go to `http://localhost:5173`
2. Allow location access when prompted (optional, for automatic weather)
3. Click the voice input button and speak in Japanese, or type a message
4. Select a theme (travel, fashion, food, etc.) from the theme selector
5. Try these example queries:
   - "今日の天気に合った服装を教えて"
   - "東京の天気を教えて"
   - "札幌" (just type a city name)

## Troubleshooting

### Backend not starting
- Make sure port 3001 is not in use
- Check that `.env` file exists in the backend directory
- Verify API keys are correct

### Voice input not working
- Make sure you've allowed microphone permissions in your browser
- Try using Chrome or Edge for best compatibility
- Check browser console for errors

### Weather not loading
- Check your internet connection
- Verify OpenWeatherMap API key is correct
- Check backend console for error messages

### AI responses not working
- Verify Gemini API key is correct
- Check backend console for API errors
- Make sure you have internet connection

