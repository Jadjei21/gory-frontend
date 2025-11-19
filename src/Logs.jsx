// components/LogsComponent.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRepo } from './context/RepoContext';

function LogsComponent() {
  const { currentRepo, refreshKey } = useRepo();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentRepo) return;

    const fetchLog = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`https://gory-server-uwryumbkoq-uc.a.run.app//logs/${currentRepo}`);
        setLog(res.data);
      } catch (err) {
        console.error('Failed to fetch logs:', err);
        setLog(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLog();
  }, [currentRepo, refreshKey]);

  if (!currentRepo) return null;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Repository Logs for <em>{currentRepo}</em></h3>
      {loading ? (
        <p>Loading...</p>
      ) : !log ? (
        <p>No logs available.</p>
      ) : (
        <>
          <p><strong>🛠 Initialized on:</strong> {new Date(log.createdAt).toLocaleString()}</p>
          <p><strong>🌿 Current branch:</strong> {log.current_branch}</p>
          <p><strong>🔀 Branches:</strong> {log.branches.join(', ')}</p>
          <hr />
          <h4>📜 Commit History</h4>
          {log.commits.length === 0 ? (
            <p>No commits yet.</p>
          ) : (
            <ul>
              {[...log.commits].map((commit, idx) => {
                const time = new Date(parseInt(commit.id)).toLocaleString();
                return (
                  <li key={idx} style={{ marginBottom: '0.75rem' }}>
                    <div><strong>🆔 {commit.id}</strong></div>
                    <div>📝 {commit.message}</div>
                    <div>⏱️ {time}</div>
                  </li>
                )
})}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default LogsComponent;
