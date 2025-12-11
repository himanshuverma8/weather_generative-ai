import { useState } from 'react';
import './CitySearch.css';

const API_BASE_URL = 'http://localhost:3001/api';

const CitySearch = ({ onCitySelect, currentCity }) => {
  const [cityInput, setCityInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const popularJapaneseCities = [
    'Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Sapporo',
    'Fukuoka', 'Hiroshima', 'Sendai', 'Nagoya', 'Kobe'
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!cityInput.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/weather?city=${encodeURIComponent(cityInput)}`);
      if (response.ok) {
        const data = await response.json();
        onCitySelect(data);
        setCityInput('');
      } else {
        alert('都市が見つかりませんでした。別の都市名をお試しください。');
      }
    } catch (error) {
      console.error('City search error:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = async (city) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/weather?city=${encodeURIComponent(city)}`);
      if (response.ok) {
        const data = await response.json();
        onCitySelect(data);
      }
    } catch (error) {
      console.error('City search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="city-search">
      <form onSubmit={handleSearch} className="city-search-form">
        <input
          type="text"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          placeholder="都市名を入力（例: 東京、大阪、京都）"
          className="city-input"
          disabled={isLoading}
        />
        <button type="submit" className="city-search-btn" disabled={isLoading || !cityInput.trim()}>
          {isLoading ? '検索中...' : '検索'}
        </button>
      </form>
      <div className="popular-cities">
        <span className="popular-label">人気の都市:</span>
        <div className="city-buttons">
          {popularJapaneseCities.map((city) => (
            <button
              key={city}
              type="button"
              className="city-btn"
              onClick={() => handleQuickSelect(city)}
              disabled={isLoading}
            >
              {city}
            </button>
          ))}
        </div>
      </div>
      {currentCity && (
        <div className="current-city">
          現在の都市: <strong>{currentCity}</strong>
        </div>
      )}
    </div>
  );
};

export default CitySearch;

