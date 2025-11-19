// components/CommitComponent.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useRepo } from './context/RepoContext';

function CommitComponent() {
  const { currentRepo, triggerRefresh } = useRepo();
  const [message, setMessage] = useState('');
  const [committing, setCommitting] = useState(false);

  if (!currentRepo) return null; // Don't show if no repo selected

  const handleCommit = async () => {
    if (!message.trim()) return alert('Commit message required.');
    setCommitting(true);

    try {
      const res = await axios.post(`https://gory-server-uwryumbkoq-uc.a.run.app/commit/${currentRepo}`, {
        message,
      });
      alert(`Committed! ID: ${res.data.commitId}`);
      triggerRefresh()
      setMessage('');
    } catch (err) {
      alert(err.response?.data?.error || 'Commit failed.');
      console.error(err);
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Commit to <em>{currentRepo}</em></h3>
      <input
        type="text"
        placeholder="Commit message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ marginRight: '1rem' }}
      />
      <button onClick={handleCommit} disabled={committing}>
        {committing ? 'Committing...' : 'Commit'}
      </button>
    </div>
  );
}

export default CommitComponent;
