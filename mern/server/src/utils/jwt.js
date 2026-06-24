import jwt from 'jsonwebtoken';

export function signAccess(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_TTL || '15m',
  });
}
export function signRefresh(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_TTL || '30d',
  });
}
