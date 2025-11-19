// components/MergeBranchComponent.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRepo } from './context/RepoContext';

function MergeBranchComponent() {
  const { currentRepo, refreshKey, triggerRefresh } = useRepo();
  const [branches, setBranches] = useState([]);
  const [currentBranch, setCurrentBranch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [status, setStatus] = useState('');
  const [conflicts, setConflicts] = useState([]);
  const [merging, setMerging] = useState(false);

  useEffect(() => {
    if (!currentRepo) return;

    const fetchBranches = async () => {
      try {
        const res = await axios.get(`https://gory-server-uwryumbkoq-uc.a.run.app/logs/${currentRepo}`);
        setBranches(res.data.branches || []);
        setCurrentBranch(res.data.current_branch);
      } catch (err) {
        console.error('Error loading branches:', err);
      }
    };

    fetchBranches();
  }, [currentRepo, refreshKey]);

  const handleMerge = async () => {
    if (!selectedBranch) return;
    if (!window.confirm(`Merge "${selectedBranch}" into "${currentBranch}"?`)) return;

    setMerging(true);
    setStatus('');
    setConflicts([]);

    try {
      const res = await axios.post(
        `https://gory-server-uwryumbkoq-uc.a.run.app/branch/${currentRepo}/merge`,
        { sourceBranch: selectedBranch }
      );
      setStatus(`✅ Merge successful: ${res.data.message}`);
      triggerRefresh();
      setSelectedBranch('');
    } catch (err) {
      if (err.response?.status === 409) {
        setStatus('❌ Merge conflict detected.');
        setConflicts(err.response.data.conflicts || []);
      } else {
        setStatus(`❌ Merge failed: ${err.response?.data?.error || err.message}`);
      }
    } finally {
      setMerging(false);
    }
  };

  if (!currentRepo) return null;

  const mergeableBranches = branches.filter((b) => b !== currentBranch);

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>🔀 Merge Branch</h3>
      {mergeableBranches.length === 0 ? (
        <p>No other branches available to merge.</p>
      ) : (
        <>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            style={{ marginRight: '1rem' }}
          >
            <option value="">Select a branch to merge</option>
            {mergeableBranches.map((b, idx) => (
              <option key={idx} value={b}>{b}</option>
            ))}
          </select>
          <button onClick={handleMerge} disabled={merging || !selectedBranch}>
            {merging ? 'Merging...' : 'Merge Branch'}
          </button>
        </>
      )}

      {status && <p style={{ marginTop: '1rem' }}>{status}</p>}

      {conflicts.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h4>⚠ Conflicting Files:</h4>
          <ul>
            {conflicts.map((file, i) => (
              <li key={i}>{file}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MergeBranchComponent;
