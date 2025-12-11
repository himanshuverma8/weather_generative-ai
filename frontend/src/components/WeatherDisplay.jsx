import './WeatherDisplay.css';

const WeatherDisplay = ({ weather }) => {
  if (!weather) return null;

  const getWeatherEmoji = (main) => {
    const emojiMap = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Mist': '🌫️',
      'Fog': '🌫️',
      'Haze': '🌫️'
    };
    return emojiMap[main] || '🌤️';
  };

  const getSeasonalEmoji = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return '🌸'; // Spring - Sakura
    if (month >= 5 && month <= 7) return '🎐'; // Summer - Wind chime
    if (month >= 8 && month <= 10) return '🍁'; // Autumn - Maple
    return '⛄'; // Winter - Snowman
  };

  return (
    <div className="weather-display">
      <div className="weather-card">
        <div className="weather-main">
          <div className="weather-icon">
            <span className="emoji-fallback">{getWeatherEmoji(weather.main)}</span>
          </div>
          <div className="weather-info">
            <h2>{getSeasonalEmoji()} {weather.city}, {weather.country}</h2>
            <div className="temperature">{weather.temperature}°C</div>
            <div className="description">{weather.description}</div>
            <div className="feels-like">体感温度: {weather.feelsLike}°C</div>
          </div>
        </div>
        <div className="weather-details">
          <div className="detail-item">
            <span className="detail-icon">💧</span>
            <span className="detail-label">湿度</span>
            <span className="detail-value">{weather.humidity}%</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">🌬️</span>
            <span className="detail-label">風速</span>
            <span className="detail-value">{weather.windSpeed} m/s</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherDisplay;

