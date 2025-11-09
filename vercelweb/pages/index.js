import { useState, useEffect } from 'react';

export default function ParentalControl() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [devices, setDevices] = useState({});
  const [selectedDevice, setSelectedDevice] = useState('');
  const [apps, setApps] = useState('');
  const [hours, setHours] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('parentToken');
    if (token) {
      setLoggedIn(true);
      fetchDevices(token);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: formData.get('username'),
        password: formData.get('password')
      })
    });

    if (response.ok) {
      const { token } = await response.json();
      localStorage.setItem('parentToken', token);
      setLoggedIn(true);
      fetchDevices(token);
    } else {
      alert('Login failed');
    }
  };

  const fetchDevices = async (token) => {
    const response = await fetch('/api/devices', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      setDevices(data);
      setSelectedDevice(Object.keys(data)[0]);
    }
  };

  const sendCommand = async (action) => {
    const token = localStorage.getItem('parentToken');
    
    const body = { device_id: selectedDevice, action };
    if (action === 'restrict_apps') body.apps = apps.split(',').map(a => a.trim());
    if (action === 'set_time_limit') body.hours = parseFloat(hours);

    const response = await fetch('/api/control', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      alert('Command sent successfully');
      fetchDevices(token);
    }
  };

  if (!loggedIn) {
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
        <h1>Parental Control Login</h1>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '15px' }}>
            <input 
              type="text" 
              name="username" 
              placeholder="Username" 
              required 
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              required 
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px' }}>
            Login
          </button>
        </form>
      </div>
    );
  }

  const device = devices[selectedDevice];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Parental Control Dashboard</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <select 
          value={selectedDevice} 
          onChange={(e) => setSelectedDevice(e.target.value)}
        >
          {Object.keys(devices).map(deviceId => (
            <option key={deviceId} value={deviceId}>{deviceId}</option>
          ))}
        </select>
      </div>

      {device && (
        <div>
          <h2>Device Status</h2>
          <p>Status: {device.locked ? '🔒 LOCKED' : '✅ UNLOCKED'}</p>
          <p>Time Used Today: {device.usage_data?.time_used_today ? 
            Math.round(device.usage_data.time_used_today / 3600 * 100) / 100 : 0} hours</p>
          <p>Current App: {device.usage_data?.current_app || 'None'}</p>
          
          <h3>Controls</h3>
          <div style={{ marginBottom: '10px' }}>
            <button onClick={() => sendCommand('lock')} style={{ marginRight: '10px' }}>
              Lock Computer
            </button>
            <button onClick={() => sendCommand('unlock')}>
              Unlock Computer
            </button>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="App names (comma separated)"
              value={apps}
              onChange={(e) => setApps(e.target.value)}
              style={{ marginRight: '10px', padding: '5px' }}
            />
            <button onClick={() => sendCommand('restrict_apps')}>
              Restrict Apps
            </button>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <input
              type="number"
              placeholder="Hours"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              style={{ marginRight: '10px', padding: '5px' }}
            />
            <button onClick={() => sendCommand('set_time_limit')}>
              Set Time Limit
            </button>
          </div>

          <h3>App Usage</h3>
          <ul>
            {device.usage_data?.app_usage && Object.entries(device.usage_data.app_usage).map(([app, seconds]) => (
              <li key={app}>
                {app}: {Math.round(seconds / 60)} minutes
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}