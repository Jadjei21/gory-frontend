import React, { useState } from 'react';
import axios from 'axios';

function CreateRepoComponent({ onRepoCreated, handleCreate }) {
  const [showPopup, setShowPopup] = useState(false);
  const [repoName, setRepoName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const onCreate = async () => {
    if (!/^[a-zA-Z0-9_-]+$/.test(repoName)) {
      return setError('Repo name must be letters, numbers, - or _ only (no spaces).');
    }

    setCreating(true);
    setError('');
    try {
      handleCreate(repoName)
      onRepoCreated?.();
      setShowPopup(false);
      setRepoName('');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create repo';
      setError(`${msg}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      {/* Floating Add Button */}
      {!showPopup && <div
        style={{
          backgroundColor: 'rgba(255,255,255,0.02)',
          color: '#fff',
          border: '1px solid ',
          borderRadius: '50%',
          width: '160px',
          height: '160px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(255,0,0,0.3)',
          animation: 'pulseScale 1.5s ease-in-out infinite',
        }}
        onClick={() => setShowPopup(true)}
        title="New Repo"
      >
        {/* <span style={{ fontSize: '34px', color: '#444' }} className="material-icons">add</span> */}
        <div style={{  color: '', fontSize: '18px' }}>
        New Repo
       </div>
      </div>}

      {/* Modal Popup */}
      {showPopup && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: '2rem',
            borderRadius: '8px',
            width: '300px',
            boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{marginBottom: '2rem'}}>Create New Repo</h3>
            <button
                onClick={() => setShowPopup(false)}
                style={{ padding: '6px 12px',  marginBottom: '2rem' }}
              >
                <span className="material-icons">close</span>
              </button>
              </div>
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="Enter repo name"
              style={{
                padding: '8px',
                width: '100%',
                marginBottom: '1rem',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
            {error && <p style={{ color: 'red', marginBottom: '1rem', textAlign: 'left' }}>{error}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={onCreate}
                disabled={creating}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#1976d2',
                  color: '#fff',
                  border: 'none',
                marginTop: '1rem',
                  borderRadius: '4px',
                }}
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CreateRepoComponent;
