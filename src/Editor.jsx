// components/EditorComponent.jsx
import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { useRepo } from './context/RepoContext';

function EditorComponent() {
  const { currentRepo, triggerRefresh } = useRepo();
  const [filePath, setFilePath] = useState('');
  const [fileContent, setFileContent] = useState('// Start coding here...');
  const [saving, setSaving] = useState(false);

  if (!currentRepo) return null;

  const handleSave = async () => {
    if (!filePath.trim()) {
      alert('Please provide a valid file path (e.g., src/index.js)');
      return;
    }

    setSaving(true);
    try {
      const blob = new Blob([fileContent], { type: 'text/plain' });
      const formData = new FormData();
      formData.append('files', blob, filePath);

      await axios.post(`https://gory-server-uwryumbkoq-uc.a.run.app/staging/${currentRepo}`, formData);
      alert(`File "${filePath}" saved to staging.`);
      triggerRefresh();
    } catch (err) {
      console.error(err);
      alert('Failed to save file.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>📝 Editor (Staging to: <em>{currentRepo}</em>)</h3>
      <input
        type="text"
        placeholder="File path (e.g. src/index.js)"
        value={filePath}
        onChange={(e) => setFilePath(e.target.value)}
        style={{ width: '300px', marginBottom: '1rem' }}
      />
      <Editor
        height="400px"
        language="javascript"
        value={fileContent}
        onChange={(val) => setFileContent(val)}
        theme="vs-dark"
      />
      <button onClick={handleSave} disabled={saving} style={{ marginTop: '1rem' }}>
        {saving ? 'Saving...' : 'Save to Staging'}
      </button>
    </div>
  );
}

export default EditorComponent;
