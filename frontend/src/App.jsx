import { useState, useEffect, useRef } from 'react';
import './App.css';
import ChatMessage from './components/ChatMessage';
import VoiceInput from './components/VoiceInput';
import ThemeSelector from './components/ThemeSelector';

const API_BASE_URL = 'http://localhost:3001/api';

function App() {
  const [messages, setMessages] = useState([]);
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [city, setCity] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('general');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Get user's location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `${API_BASE_URL}/weather?lat=${latitude}&lon=${longitude}`
            );
            if (response.ok) {
              const data = await response.json();
              setWeather(data);
              setCity(data.city);
            }
          } catch (error) {
            console.error('Failed to fetch weather:', error);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleVoiceInput = async (transcript) => {
    if (!transcript.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: transcript,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Get current location for weather
      let lat = null;
      let lon = null;
      let cityName = city;

      if (navigator.geolocation) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              lat = position.coords.latitude;
              lon = position.coords.longitude;
              resolve();
            },
            () => resolve()
          );
        });
      }

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: transcript,
          city: cityName,
          lat,
          lon,
          theme: selectedTheme
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      // Update weather if available
      if (data.weather) {
        setWeather(data.weather);
        if (!city) setCity(data.weather.city);
      }

      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: '申し訳ございませんが、エラーが発生しました。もう一度お試しください。',
        sender: 'ai',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = async (text) => {
    if (!text.trim()) return;
    await handleVoiceInput(text);
  };

  return (
    <div className="app">
      <div className="app-container">
        <header className="app-header">
          <h1>天気 AI アシスタント</h1>
          <p>日本の天気情報を考慮したスマートなAIアドバイザー</p>
        </header>

        <ThemeSelector 
          selectedTheme={selectedTheme} 
          onThemeChange={setSelectedTheme} 
        />

        <div className="chat-container">
          <div className="messages">
            {messages.length === 0 && (
              <div className="welcome-message">
                <h2>ようこそ！</h2>
                <p>音声入力またはテキストで質問してください</p>
                <div className="example">
                  🗣️「今日の天気に合った服装を教えて」
                </div>
                <div className="example">
                  🗣️「雨の日におすすめのアクティビティは？」
                </div>
                <div className="example">
                  🗣️「東京の天気を教えて」
                </div>
              </div>
            )}
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="message ai-message loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <VoiceInput
            onTranscript={handleVoiceInput}
            onTextSubmit={handleTextSubmit}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
