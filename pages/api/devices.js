import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
let deviceData = {
  'SONS_PC_001': {
    locked: false,
    restricted_apps: [],
    time_limit: 2,
    last_sync: null,
    usage_data: {}
  }
};

export default function handler(req, res) {
  // Verify token
  const token = req.headers.authorization?.replace('Bearer ', '');
  try {
    jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.status(200).json(deviceData);
}