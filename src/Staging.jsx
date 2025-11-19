// components/StagingComponent.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useRepo } from './context/RepoContext';

function StagingComponent() {
  const { currentRepo, triggerRefresh } = useRepo();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  if (!currentRepo) return null; // 👈 don't render unless a repo is selected

  const handleUpload = async () => {
    if (files.length === 0) return alert("No files selected");
    setUploading(true);
  
    const formData = new FormData();
    for (const file of files) {
      // Preserve folder structure via webkitRelativePath (fallback to name)
      const path = file.webkitRelativePath || file.name;
      formData.append('files', file, path);
    }
  
    try {
      await axios.post(`https://gory-server-uwryumbkoq-uc.a.run.app/staging/${currentRepo}`, formData);
      alert("Files staged!");
      triggerRefresh()
      setFiles([]);
    } catch (err) {
      alert("Staging failed");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <h3>Stage Files for <em>{currentRepo}</em></h3>
      <input
  type="file"
  multiple
  onChange={(e) => setFiles([...e.target.files])}
/>
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Stage Files'}
      </button>
      <ul>
  {files.map((file, idx) => (
    <li key={idx}>
      {file.webkitRelativePath || file.name}
    </li>
  ))}
</ul>
    </div>
  );
}

export default StagingComponent;
