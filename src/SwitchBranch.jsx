// components/SwitchBranchComponent.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRepo } from './context/RepoContext';

function SwitchBranchComponent() {
  const { currentRepo, triggerRefresh , refreshKey} = useRepo();
  const [branches, setBranches] = useState([]);
  const [currentBranch, setCurrentBranch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (!currentRepo) return;

    const fetchBranches = async () => {
      try {
        const res = await axios.get(`https://gory-server-uwryumbkoq-uc.a.run.app/logs/${currentRepo}`);
        setBranches(res.data.branches || []);
        setCurrentBranch(res.data.current_branch);
        setSelectedBranch(res.data.current_branch);
      } catch (err) {
        console.error('Error loading branch list', err);
      }
    };

    fetchBranches();
  }, [currentRepo, refreshKey ]);

  const handleSwitch = async () => {
    if (selectedBranch === currentBranch) return alert('Already on this branch');

    setSwitching(true);
    try {
      await axios.post(`https://gory-server-uwryumbkoq-uc.a.run.app/branch/${currentRepo}/switch`, {
        targetBranch: selectedBranch
      });
      setCurrentBranch(selectedBranch)
      alert(`Switched to branch "${selectedBranch}"`);
      triggerRefresh();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to switch branch');
    } finally {
      setSwitching(false);
    }
  };

  if (!currentRepo) return null;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>🔀 Switch Branch</h3>
      <p><strong>Current Branch:</strong> {currentBranch}</p>

      <select
        value={selectedBranch}
        onChange={(e) => setSelectedBranch(e.target.value)}
        style={{ marginRight: '1rem' }}
      >
        {branches.map((b, idx) => (
          <option key={idx} value={b}>{b}</option>
        ))}
      </select>

      <button onClick={handleSwitch} disabled={switching || selectedBranch === currentBranch}>
        {switching ? 'Switching...' : 'Switch'}
      </button>
    </div>
  );
}

export default SwitchBranchComponent;
