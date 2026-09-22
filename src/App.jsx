import { useState, useEffect } from 'react';
import './App.css'

function App() {
  const [version, setVersion] = useState('');
  const [updateStatus, setUpdateStatus] = useState('idle');
  const [availableVersion, setAvailableVersion] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    if (window.electronAPI && window.electronAPI.getAppVersion) {
      window.electronAPI.getAppVersion().then(setVersion);
    }

    if (window.electronAPI) {
      if (window.electronAPI.onUpdateProgress) {
        window.electronAPI.onUpdateProgress((progressObj) => {
          setDownloadProgress(Math.round(progressObj.percent));
        });
      }
      if (window.electronAPI.onUpdateDownloaded) {
        window.electronAPI.onUpdateDownloaded(() => {
          setUpdateStatus('downloaded');
        });
      }
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

  const downloadUpdate = async () => {
    if (!window.electronAPI || !window.electronAPI.downloadUpdate) return;
    setUpdateStatus('downloading');
    try {
      await window.electronAPI.downloadUpdate();
    } catch (error) {
      console.error(error);
      setUpdateStatus('error');
    }
  };

  const installUpdate = () => {
    if (!window.electronAPI || !window.electronAPI.installUpdate) return;
    window.electronAPI.installUpdate();
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1>Hello Jenkins 2.0.9</h1>
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
              <div style={{ marginTop: '10px' }}>
                <p style={{ color: '#4ade80', marginBottom: '10px', fontSize: '0.9em' }}>
                  Update available: v{availableVersion}
                </p>
                <button 
                  onClick={downloadUpdate}
                  style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#4ade80', color: '#111', border: 'none', borderRadius: '4px' }}
                >
                  Download Update
                </button>
              </div>
            )}
            
            {updateStatus === 'downloading' && (
              <div style={{ marginTop: '15px' }}>
                <p style={{ fontSize: '0.9em', color: '#fff', marginBottom: '5px' }}>Downloading... {downloadProgress}%</p>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${downloadProgress}%`, height: '100%', backgroundColor: '#4ade80', transition: 'width 0.2s' }}></div>
                </div>
              </div>
            )}

            {updateStatus === 'downloaded' && (
              <div style={{ marginTop: '15px' }}>
                <p style={{ color: '#4ade80', marginBottom: '10px', fontSize: '0.9em' }}>
                  Update downloaded successfully!
                </p>
                <button 
                  onClick={installUpdate}
                  style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
                >
                  Restart & Install
                </button>
              </div>
            )}

            {updateStatus === 'up-to-date' && (
              <p style={{ color: '#9ca3af', marginTop: '10px', fontSize: '0.9em' }}>
                You are up to date.
              </p>
            )}
            {updateStatus === 'error' && (
              <p style={{ color: '#f87171', marginTop: '10px', fontSize: '0.9em' }}>
                Error checking or downloading updates. Check your connection.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
