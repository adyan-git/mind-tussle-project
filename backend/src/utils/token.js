import jwt from 'jsonwebtoken';
const { JWT_SECRET, JWT_EXPIRES_IN, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRES_IN } = process.env;

export function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN || '1h' });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function signRefreshToken(payload) {
  if (!REFRESH_TOKEN_SECRET) throw new Error('REFRESH_TOKEN_SECRET not set');
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN || '7d' });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
}
