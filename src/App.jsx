import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { useEffect } from 'react';
// import { connect } from './WebSocketService';
import './App.css'
import { RepoProvider } from './context/RepoContext';
// import SpeechDisplay from './SpeechDisplay'
import TranscriptionComponent from './Transcription';
import SpeechDisplayComponent from './SpeechDisplay';
import CommitUploader from './Commit';
import RepoList from './RepoList';
import RepoDisplay from './RepoDisplay';
import StagingComponent from './Staging';
import CommitComponent from './Commit';
import StatusComponent from './Status';
import LogsComponent from './Logs';
import EditorComponent from './Editor';
import BranchComponent from './branch';
import SwitchBranchComponent from './SwitchBranch';
import DeleteBranchComponent from './DeleteBranch';
import MergeBranchComponent from './MergeBranch';
import OrbitView from './OrbitView';

function App() {
  const [count, setCount] = useState(0)
  const [transcribedText, setTranscribedText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const handleRecordingStatusChange = (status) => {
    setIsRecording(status);
    // Optionally emit to parent via props
  };

  const handleTranscribedTextChange = (text) => {
    setTranscribedText(text);
  };
  // useEffect(() => {
  //   connect(); // Connect once when app starts
  // }, []);

  return (
    <RepoProvider>
       <div className="app-container">
      <SpeechDisplayComponent
      />
      <RepoDisplay/>
      <RepoList/>
      {/* <BranchComponent/>
      <SwitchBranchComponent/>
      <MergeBranchComponent/>
      <DeleteBranchComponent/> */}
      <OrbitView 
/>

      {/* <StagingComponent/>
      <CommitComponent/>
      <StatusComponent/>
    
      <LogsComponent/> */}
      {/* <EditorComponent/> */}
      {/* <TranscriptionComponent/> */}
     </div>
    </RepoProvider>
  )
}

export default App
