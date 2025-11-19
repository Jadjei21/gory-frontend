// components/StatusComponent.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRepo } from './context/RepoContext';

function StatusComponent() {
  const { currentRepo, refreshKey } = useRepo();
  const [stagedFiles, setStagedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentRepo) return;

    const fetchStatus = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`https://gory-server-uwryumbkoq-uc.a.run.app/status/${currentRepo}`);
        setStagedFiles(res.data.staged || []);
      } catch (err) {
        console.error('Failed to fetch status:', err);
        setStagedFiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [currentRepo, refreshKey]); // <-- re-fetch on refreshKey change

  if (!currentRepo) return null;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Staged Files in <em>{currentRepo}</em></h3>
      {loading ? (
        <p>Loading...</p>
      ) : stagedFiles.length === 0 ? (
        <p>No files staged.</p>
      ) : (
        <ul>
          {stagedFiles.map((file, idx) => (
            <li key={idx}>{file}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default StatusComponent;
