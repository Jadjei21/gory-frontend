// components/RepoList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRepo } from './context/RepoContext';
import CreateRepoComponent from './CreateRepo';

function RepoList() {
    const [repos, setRepos] = useState([]);
    const itemCount = repos.length;
  const angleStep = 360 / itemCount;

    const { currentRepo, setCurrentRepo, triggerRefresh } = useRepo();
    const handleSelectRepo = (repo) => {
        setCurrentRepo(repo);
        console.log('Selected repo:', repo);
    };
    const [repoName, setRepoName] = useState('');
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
  const fetchRepos = async () => {
    try {
      const response = await axios.get('https://gory-server-uwryumbkoq-uc.a.run.app/repos');
      setRepos(response.data.repos);
    } catch (error) {
      console.error('Failed to fetch repos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);
  const handleCreate = async (repoName) => {
    if (!repoName.trim()) return alert('Please enter a valid repo name.');
    setCreating(true);
    try {
      await axios.post('https://gory-server-uwryumbkoq-uc.a.run.app/init', { repoName });
      await fetchRepos();
      handleSelectRepo(repoName.trim());
      setRepoName('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create repo.');
    } finally {
      setCreating(false);
    }
  };
  if (loading) return <p>Loading repositories...</p>;
  if (currentRepo) return null;
  return (
    <div>
      

      {loading ? (
        <p>....Loading repositories...</p>
      ) : repos.length === 0 ? (
        <p></p>
      ) : (
            <div  className="repo-carousel">
            <div className="repo-carousel-inner">
            <div style={{ marginBottom: '4rem' }}>
        <CreateRepoComponent handleCreate={handleCreate} onRepoCreated={triggerRefresh}/>
      </div>
              {repos.map((repo, index) => {
                const angle = index * angleStep;
                const transform = `rotateY(${angle}deg) translateZ(200px)`;
      
                return (
                  <div
                  key={index}
        style={{
          backgroundColor: `rgba(255,${angle},255,0.02)`,
          color: '#fff',
          border: '1px solid ',
          borderRadius: '50%',
          width:  repo !== currentRepo ? '160px' : '180px',
          height:  repo !== currentRepo ? '160px' : '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: repo !== currentRepo ? '0 4px 12px rgba(255,0,0,0.3)' : '0 6px 12px rgba(5,0,255,0.3)',
          animation: 'pulseScale 1.5s ease-in-out infinite',
        }}
        onClick={() => handleSelectRepo(repo)}
        title="New Repo"
      >
        {/* <span style={{ fontSize: '34px', color: '#444' }} className="material-icons">add</span> */}
        <div style={{  color: '', fontSize: '18px' }}>
        {repo.charAt(0).toUpperCase() + repo.slice(1)}
       </div>
      </div>
                  // <div key={index} className="repo-item" style={{ transform }}>
                  //   {repo}
                  // </div>
                );
              })}
            </div>
          </div>
            // <li key={repo} onClick={() => handleSelectRepo(repo)}>
            //   <>{repo.charAt(0).toUpperCase() + repo.slice(1)}</> {/* bookmark this part */}
            // </li>
      )}
    </div>
  );
}

export default RepoList;

// If you want to link each repo to its logs:

// jsx
// Copy
// <li key={repo}>
//   <a href={`/logs/${repo}`}>{repo}</a>
// </li>
// Or use React Router’s <Link> for internal routing:

// jsx
// Copy
// import { Link } from 'react-router-dom';

// <Link to={`/logs/${repo}`}>{repo}</Link>
// Let me know if you want help creating a full repo dashboard view or routing to repo-specific pages.







