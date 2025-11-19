import React, { useState, useEffect } from 'react';
import SpeechRecognition,  {useSpeechRecognition} from 'react-speech-recognition';

const TranscriptionComponent = () => {
  const [transcriptText, setTranscriptText] = useState('');
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    setTranscriptText(transcript);
  }, [transcript]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser does not support speech recognition.</span>;
  }

  return (
    <div>
      <p>Microphone: {listening ? 'on' : 'off'}</p>
      <button
  onClick={() =>
    SpeechRecognition.startListening({
      continuous: true,
      interimResults: true,
      language: 'en-US',
    })
  }
>
  Start
</button>
<button onClick={SpeechRecognition.stopListening}>Stop</button>
<button onClick={resetTranscript}>Reset</button>

      <p>{transcriptText}</p>
    </div>
  );
};

export default TranscriptionComponent;