import './ThemeSelector.css';

const themes = [
  { id: 'travel', name: '旅行', icon: '✈️', description: '旅行・観光' },
  { id: 'outings', name: 'お出かけ', icon: '🚶', description: '外出・アクティビティ' },
  { id: 'fashion', name: 'ファッション', icon: '👔', description: '服装・スタイル' },
  { id: 'music', name: '音楽', icon: '🎵', description: '音楽・エンターテイメント' },
  { id: 'agriculture', name: '農業', icon: '🌾', description: '農業・ガーデニング' },
  { id: 'sports', name: 'スポーツ', icon: '⚽', description: 'スポーツ・運動' },
  { id: 'food', name: 'グルメ', icon: '🍜', description: '食事・料理' },
  { id: 'general', name: '一般', icon: '💬', description: '一般的な提案' }
];

const ThemeSelector = ({ selectedTheme, onThemeChange }) => {
  return (
    <div className="theme-selector">
      <h3>テーマを選択してください</h3>
      <div className="theme-grid">
        {themes.map((theme) => (
          <button
            key={theme.id}
            className={`theme-card ${selectedTheme === theme.id ? 'active' : ''}`}
            onClick={() => onThemeChange(theme.id)}
            type="button"
          >
            <span className="theme-icon">{theme.icon}</span>
            <span className="theme-name">{theme.name}</span>
            <span className="theme-description">{theme.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;

