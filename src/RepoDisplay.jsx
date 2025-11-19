import React from 'react';
import { RepoProvider, useRepo } from './context/RepoContext';

function RepoDisplay() {
  const { currentRepo } = useRepo();

  return currentRepo ? (
    <div style={{ marginBottom: '1rem' }}>
      {/* <strong>Current Repo:</strong> {currentRepo.charAt(0).toUpperCase() + currentRepo.slice(1)} */}
    </div>
  ) : null;
}
export default RepoDisplay