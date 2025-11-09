import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
let deviceData = {};

export default function handler(req, res) {
  // Verify token
  const token = req.headers.authorization?.replace('Bearer ', '');
  try {
    jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { device_id, action, apps, hours } = req.body;

  if (!deviceData[device_id]) {
    deviceData[device_id] = {
      locked: false,
      restricted_apps: [],
      time_limit: 2
    };
  }

  switch (action) {
    case 'lock':
      deviceData[device_id].locked = true;
      break;
    case 'unlock':
      deviceData[device_id].locked = false;
      break;
    case 'restrict_apps':
      deviceData[device_id].restricted_apps = apps || [];
      break;
    case 'set_time_limit':
      deviceData[device_id].time_limit = hours;
      break;
  }

  res.status(200).json({ success: true });
}