import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || 
  '$2a$10$8K1p/a0dRa1B0Z2B.QS0.eG4b.YK5g7DfYwJ.T6c7qy7nL1qy2W.S'; // "password"

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;
    
    if (username === ADMIN_USERNAME && 
        bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
      res.status(200).json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}