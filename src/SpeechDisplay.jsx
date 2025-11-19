import React, { useEffect, useRef, useState } from 'react';
import { useRepo } from './context/RepoContext';



const SpeechDisplayComponent = () => {
  const [completedSentences, setCompletedSentences] = useState('');
  const [currentWord, setCurrentWord] = useState('');
  const [transcribedText, setTranscribedText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ttsResponseText, setTtsResponseText] = useState('');
  const [hasEdits, setHasEdits] = useState(false);
  const [isEditingEnabled, setIsEditingEnabled] = useState(true);

  const mediaRecorderRef = useRef(null);
  const socketRef = useRef(null);
  const streamRef = useRef(null);
  const latestTranscriptRef = useRef('');
  const { createRepo, createBranch, deleteBranch, switchBranch, currentRepo } = useRepo();

const executeIntent = (intentData) => {
  const { intent, params } = intentData;
  console.log(intent)
  switch (intent) {
    case 'create_repo':
      createRepo(params.repoName);
      break;
    case 'create_branch':
      createBranch(params.branchName, currentRepo);
      break;
    case 'delete_branch':
      deleteBranch(params.branchName, currentRepo);
      break;
    case 'switch_branch':
      switchBranch(params.branchName, currentRepo);
      break;
    default:
      alert(`Unknown intent: ${intent}`);
  }
};
  useEffect(() => {
    socketRef.current = new WebSocket(`wss://gory-server-uwryumbkoq-uc.a.run.app/?token=${1234}`);
    
    socketRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'transcription') {
        handleTranscription(msg.transcriptObject);
      } else if (msg.audio || msg.text) {
        handleTTSMessage(msg);
      } else if (msg.type === 'intent') {
        setIsLoading(false);
        executeIntent(msg.intentData)
        console.log('✨ Received intent:', msg.intentData);
  
        // Optional: speak it out, display, or pass to an action handler
        const summary = `Intent: ${msg.intentData.intent}, with params: ${JSON.stringify(msg.intentData.params)}`;
        handleTTSMessage(summary);
      }
    };

    return () => {
      socketRef.current?.close();
      stopRecording();
    };
  }, []);

  useEffect(() => {
    const full = `${completedSentences} ${currentWord}`.trim();
    setTranscribedText(full);
    latestTranscriptRef.current = full;
  }, [completedSentences, currentWord]);

  const handleTranscription = ({ alternatives, isFinal }) => {
    const newText = alternatives[0].transcript;
    if (isFinal) {
      setCompletedSentences(prev => `${prev} ${newText}`.trim());
      setCurrentWord('');
    } else {
      setCurrentWord(newText);
    }
  };

  const handleTTSMessage = ({ audio, text, words }) => {
    setIsLoading(false);
    const resultText = words?.join(' ') || text?.trim() || '';
    setTtsResponseText(resultText);
    if (audio) playAudio(audio);
  };

  const playAudio = (base64) => {
    const audioBlob = base64ToBlob(base64, 'audio/mp3');
    const audioURL = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioURL);
    audio.play().then(() => console.log('Audio played'));
    audio.onended = () => {
      setTimeout(() => {
        if (!isRecording) startRecording();
      }, 2000);
    };
  };

  const base64ToBlob = (base64, type) => {
    const binary = atob(base64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    return new Blob([buffer], { type });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          socketRef.current?.send(e.data);
        }
      };
      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setIsEditingEnabled(false);
      setHasEdits(false);
    } catch (err) {
      console.error('Mic error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
    setIsEditingEnabled(true);
  };

  const submitResponse = () => {
    stopRecording();
    setIsLoading(true);

    // Slight delay to ensure latest transcript is stable
    setTimeout(() => {
      socketRef.current?.send(JSON.stringify({
        action: "responseComplete",
        text: latestTranscriptRef.current
      }));
      setTranscribedText('');
      setCompletedSentences('');
      setCurrentWord('');
      setHasEdits(false);
    }, 150);
  };

  return (
    <div className="speech-container">
      {isLoading && <div className="loading">Loading...</div>}

      <textarea
        value={transcribedText}
        disabled={!isEditingEnabled || isLoading}
        onFocus={() => setIsEditingEnabled(true)}
        onChange={e => {
          setTranscribedText(e.target.value);
          latestTranscriptRef.current = e.target.value;
          setHasEdits(true);
        }}
        placeholder="What do you want to do?"
        rows={3}
      />

      {ttsResponseText && <div className="tts-text">{ttsResponseText}</div>}

      <div className="button-group">
        <button disabled={isLoading || hasEdits} onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? 'Stop' : 'Record'}
        </button>
        <button disabled={isLoading || !transcribedText.trim()} onClick={submitResponse}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default SpeechDisplayComponent;
