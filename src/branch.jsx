// components/BranchComponent.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRepo } from './context/RepoContext';

function BranchComponent() {
  const { currentRepo, triggerRefresh, refreshToken } = useRepo();
  const [branches, setBranches] = useState([]);
  const [branchName, setBranchName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!currentRepo) return;

    const fetchBranches = async () => {
      try {
        const res = await axios.get(`https://gory-server-uwryumbkoq-uc.a.run.app//logs/${currentRepo}`);
        setBranches(res.data.branches || []);
      } catch (err) {
        console.error('Failed to load branches', err);
      }
    };

    fetchBranches();
  }, [currentRepo, refreshToken]);

  const handleCreate = async () => {
    if (!branchName.trim()) return alert('Enter a valid branch name.');
    setCreating(true);

    try {
      await axios.post(`https://gory-server-uwryumbkoq-uc.a.run.app/branch/${currentRepo}`, {
        branchName: branchName.trim(),
      });
      alert(`Branch "${branchName}" created!`);
      setBranches(prev => [...prev, branchName]);
      setBranchName('');
      triggerRefresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create branch.');
    } finally {
      setCreating(false);
    }
  };

  if (!currentRepo) return null;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Branches for <em>{currentRepo}</em></h3>
      <ul>
        {branches.map((b, idx) => (
          <li key={idx}>{b}</li>
        ))}
      </ul>

      <div style={{ marginTop: '1rem' }}>
        <input
          type="text"
          placeholder="New branch name"
          value={branchName}
          onChange={(e) => setBranchName(e.target.value)}
        />
        <button onClick={handleCreate} disabled={creating} style={{ marginLeft: '0.5rem' }}>
          {creating ? 'Creating...' : 'Create Branch'}
        </button>
      </div>
    </div>
  );
}

export default BranchComponent;
