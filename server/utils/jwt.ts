import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET!;

export function signToken(payload: Object) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '31d' });
}
export function verifyToken(token: string) {
  return jwt.verify(token, SECRET_KEY);
}
