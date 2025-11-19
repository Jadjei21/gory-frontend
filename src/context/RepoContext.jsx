import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const RepoContext = createContext();

export const useRepo = () => useContext(RepoContext);

export const RepoProvider = ({ children }) => {
  const [currentRepo, setCurrentRepo] = useState(() => {
    return localStorage.getItem('currentRepo') || null;
  });
    const [currentBranch, setCurrentBranch] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    if (currentRepo) {
      localStorage.setItem('currentRepo', currentRepo);
    }
  }, [currentRepo]);
  
  const triggerRefresh = () => setRefreshKey(prev => prev + 1);
  console.log(currentRepo)
  const createRepo = async (repoName) => {
    if (!repoName.trim()) return alert('Please enter a valid repo name.');

    try {
      await axios.post('https://gory-server-uwryumbkoq-uc.a.run.app/init', { repoName });
      setCurrentRepo(repoName.trim());
      triggerRefresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create repo.');
    }
  };

  const createBranch = async (branchName, currentRepo) => {
    console.log(branchName, currentRepo)
    if (!branchName.trim() || !currentRepo) return alert('Enter a valid branch name.');
    try {
      await axios.post(`https://gory-server-uwryumbkoq-uc.a.run.app/branch/${currentRepo}`, {
        branchName: branchName.trim()
      });
      alert(`Branch "${branchName}" created!`);
      triggerRefresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create branch.');
    }
  };

  const deleteBranch = async (branchName, currentRepo) => {
    if (!currentRepo || !branchName) return;
    if (!window.confirm(`Are you sure you want to delete branch "${branchName}"?`)) return;

    try {
      await axios.delete(`https://gory-server-uwryumbkoq-uc.a.run.app/branch/${currentRepo}/${branchName}`);
      alert(`Branch "${branchName}" deleted.`);
      triggerRefresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete branch.');
    }
  };

  const switchBranch = async (branchName, currentRepo) => {
    if (!currentRepo || branchName === currentBranch) {
      alert('Already on this branch');
      return;
    }

    try {
      await axios.post(`https://gory-server-uwryumbkoq-uc.a.run.app/branch/${currentRepo}/switch`, {
        targetBranch: branchName
      });
      setCurrentBranch(branchName);
      alert(`Switched to branch "${branchName}"`);
      triggerRefresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to switch branch');
    }
  };
  const exitRepo = () => {
    setCurrentRepo(null);
    setCurrentBranch(null);
    localStorage.removeItem('currentRepo');
    triggerRefresh(); // optional, if you want to reset UI
  };
  
  return (
    <RepoContext.Provider value={{
      currentRepo,
      currentBranch,
      setCurrentRepo,
      setCurrentBranch,
      createRepo,
      createBranch,
      deleteBranch,
      exitRepo,
      switchBranch,
      refreshKey,
      triggerRefresh
    }}>
      {children}
    </RepoContext.Provider>
  );
};
