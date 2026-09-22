import { useState, useEffect } from 'react';
import './App.css'

function App() {
  const [version, setVersion] = useState('');
  const [updateStatus, setUpdateStatus] = useState('idle');
  const [availableVersion, setAvailableVersion] = useState('');

  useEffect(() => {
    if (window.electronAPI && window.electronAPI.getAppVersion) {
      window.electronAPI.getAppVersion().then(setVersion);
    }
  }, []);

  const checkForUpdates = async () => {
    if (!window.electronAPI || !window.electronAPI.checkForUpdates) return;
    
    setUpdateStatus('checking');
    try {
      const result = await window.electronAPI.checkForUpdates();
      if (result && result.updateInfo) {
        const newVersion = result.updateInfo.version;
        // Simple string comparison for versions (fine for semantic versioning exact matches)
        if (newVersion !== version) {
          setAvailableVersion(newVersion);
          setUpdateStatus('available');
        } else {
          setUpdateStatus('up-to-date');
        }
      } else {
        setUpdateStatus('up-to-date');
      }
    } catch (error) {
      console.error(error);
      setUpdateStatus('error');
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1>Hello Jenkins 2.0.2</h1>
        <p>Jenkins CI/CD Demo</p>
        
        {version && (
          <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ fontSize: '0.9em', color: '#888', marginBottom: '10px' }}>
              Version: {version}
            </p>
            <button 
              onClick={checkForUpdates} 
              disabled={updateStatus === 'checking'}
              style={{ padding: '8px 16px', cursor: updateStatus === 'checking' ? 'wait' : 'pointer' }}
            >
              {updateStatus === 'checking' ? 'Checking for updates...' : 'Check for Updates'}
            </button>
            
            {updateStatus === 'available' && (
              <p style={{ color: '#4ade80', marginTop: '10px', fontSize: '0.9em' }}>
                Update available: v{availableVersion}
              </p>
            )}
            {updateStatus === 'up-to-date' && (
              <p style={{ color: '#9ca3af', marginTop: '10px', fontSize: '0.9em' }}>
                You are up to date.
              </p>
            )}
            {updateStatus === 'error' && (
              <p style={{ color: '#f87171', marginTop: '10px', fontSize: '0.9em' }}>
                Error checking for updates. Check your connection.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
