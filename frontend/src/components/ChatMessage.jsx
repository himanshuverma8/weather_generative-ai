import './ChatMessage.css';

const ChatMessage = ({ message }) => {
  // Parse the AI response if it's JSON formatted
  const parseResponse = (text) => {
    if (message.sender !== 'ai') return null;
    
    try {
      // Try to parse as JSON
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // Try direct JSON parse
      if (text.trim().startsWith('{')) {
        return JSON.parse(text);
      }
    } catch (e) {
      // Not JSON, return null
    }
    return null;
  };

  const renderFormattedResponse = (data) => {
    return (
      <div className="formatted-response">
        {data.greeting && (
          <p className="response-greeting">{data.greeting}</p>
        )}
        
        {data.weather_summary && (
          <div className="response-weather">
            <span className="weather-icon">🌤️</span>
            <span>{data.weather_summary}</span>
          </div>
        )}
        
        {data.main_suggestion && (
          <p className="response-main">{data.main_suggestion}</p>
        )}
        
        {data.recommendations && data.recommendations.length > 0 && (
          <div className="response-recommendations">
            <h4>おすすめ</h4>
            <ul>
              {data.recommendations.map((rec, index) => (
                <li key={index}>
                  {rec.icon && <span className="rec-icon">{rec.icon}</span>}
                  <div className="rec-content">
                    {rec.title && <strong>{rec.title}</strong>}
                    {rec.description && <span>{rec.description}</span>}
                    {typeof rec === 'string' && <span>{rec}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {data.tips && data.tips.length > 0 && (
          <div className="response-tips">
            <h4>💡 ヒント</h4>
            <ul>
              {data.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
        
        {data.closing && (
          <p className="response-closing">{data.closing}</p>
        )}
      </div>
    );
  };

  const renderTextResponse = (text) => {
    // Split by line breaks and format
    const lines = text.split('\n').filter(line => line.trim());
    
    return (
      <div className="text-response">
        {lines.map((line, index) => {
          // Check for bullet points
          if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('・')) {
            return (
              <p key={index} className="bullet-point">
                {line.replace(/^[•\-・]\s*/, '')}
              </p>
            );
          }
          // Check for numbered lists
          if (/^\d+[.、)]\s/.test(line.trim())) {
            return (
              <p key={index} className="numbered-item">
                {line}
              </p>
            );
          }
          // Regular paragraph
          return <p key={index}>{line}</p>;
        })}
      </div>
    );
  };

  const parsedData = parseResponse(message.text);

  return (
    <div className={`message ${message.sender}-message ${message.isError ? 'error' : ''}`}>
      <div className="message-content">
        <div className="message-header">
          <span className="sender-avatar">
            {message.sender === 'user' ? '👤' : '🤖'}
          </span>
          <span className="sender-name">
            {message.sender === 'user' ? 'あなた' : 'AIアシスタント'}
          </span>
          <span className="timestamp">
            {message.timestamp.toLocaleTimeString('ja-JP', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        <div className="message-body">
          {message.sender === 'ai' && parsedData ? (
            renderFormattedResponse(parsedData)
          ) : (
            renderTextResponse(message.text)
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
