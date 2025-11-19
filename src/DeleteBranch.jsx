// components/DeleteBranchComponent.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRepo } from './context/RepoContext';

function DeleteBranchComponent() {
  const { currentRepo, refreshKey, triggerRefresh } = useRepo();
  const [branches, setBranches] = useState([]);
  const [currentBranch, setCurrentBranch] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('');

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

  const handleDelete = async () => {
    if (!selectedBranch) return;
    if (!window.confirm(`Are you sure you want to delete branch "${selectedBranch}"?`)) return;

    setDeleting(true);
    try {
      await axios.delete(`https://gory-server-uwryumbkoq-uc.a.run.app/branch/${currentRepo}/${selectedBranch}`);
      alert(`Branch "${selectedBranch}" deleted.`);
      triggerRefresh();
      setSelectedBranch('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete branch.');
    } finally {
      setDeleting(false);
    }
  };

  if (!currentRepo) return null;

  const deletableBranches = branches.filter((b) => b !== currentBranch);

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>🗑 Delete Branch</h3>
      {deletableBranches.length === 0 ? (
        <p>No deletable branches available.</p>
      ) : (
        <>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            style={{ marginRight: '1rem' }}
          >
            <option value="">Select a branch</option>
            {deletableBranches.map((b, idx) => (
              <option key={idx} value={b}>{b}</option>
            ))}
          </select>
          <button onClick={handleDelete} disabled={deleting || !selectedBranch}>
            {deleting ? 'Deleting...' : 'Delete Branch'}
          </button>
        </>
      )}
    </div>
  );
}

export default DeleteBranchComponent;
