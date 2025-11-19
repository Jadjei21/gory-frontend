import React, { useState, useEffect, useRef } from 'react';

const SpeechChatAssistant = () => {
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      console.log('Transcript:', text);
      const gptReply = await getGPTResponse(text);
      setResponse(gptReply);
      speak(gptReply);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    setTranscript('');
    setResponse('');
    recognitionRef.current?.start();
  };

  const getGPTResponse = async (prompt) => {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
         'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || 'Sorry, I have no response.';
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <button onClick={startListening} className="bg-blue-600 text-white px-4 py-2 rounded">
        🎤 Start Talking
      </button>
      <div className="bg-gray-100 p-3 rounded border">
        <strong>You said:</strong> {transcript || '—'}
      </div>
      <div className="bg-green-100 p-3 rounded border">
        <strong>GPT replied:</strong> {response || '—'}
      </div>
    </div>
  );
};

export default SpeechChatAssistant;
