import { useState, useEffect, useRef } from 'react';
import './VoiceInput.css';

const VoiceInput = ({ onTranscript, onTextSubmit, disabled }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const recognitionRef = useRef(null);

  const finalTranscriptRef = useRef('');

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'ja-JP';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        finalTranscriptRef.current = '';
        setTranscript('');
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          finalTranscriptRef.current = finalTranscript;
        }

        setTranscript(finalTranscript || interimTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'no-speech') {
          alert('音声が検出されませんでした。もう一度お試しください。');
        } else if (event.error === 'not-allowed') {
          alert('マイクの許可が必要です。ブラウザの設定を確認してください。');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        const finalText = finalTranscriptRef.current.trim();
        if (finalText) {
          onTranscript(finalText);
          finalTranscriptRef.current = '';
          setTranscript('');
        }
      };

      recognitionRef.current = recognition;
    } else {
      console.warn('Speech recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscript]);

  const startListening = () => {
    if (recognitionRef.current && !isListening && !disabled) {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim() && !disabled) {
      onTextSubmit(textInput);
      setTextInput('');
    }
  };

  return (
    <div className="voice-input">
      <form onSubmit={handleTextSubmit} className="text-input-form">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="テキストで入力するか、音声ボタンを押してください..."
          className="text-input"
          disabled={disabled || isListening}
        />
        <button
          type="submit"
          className="submit-btn"
          disabled={disabled || isListening || !textInput.trim()}
        >
          送信
        </button>
      </form>

      <div className="voice-controls">
        <button
          className={`voice-btn ${isListening ? 'listening' : ''}`}
          onClick={isListening ? stopListening : startListening}
          disabled={disabled}
          type="button"
        >
          {isListening ? (
            <>
              <span className="pulse"></span>
              <span>🎤 音声認識中...</span>
            </>
          ) : (
            <>
              <span>🎤</span>
              <span>音声入力</span>
            </>
          )}
        </button>
        {transcript && (
          <div className="transcript-preview">
            <p>{transcript}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceInput;

