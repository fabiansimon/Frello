import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET!;

// Sign JSON Web Token with given payload
export function signToken(payload: Object) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '31d' });
}

// Verifies a JSON Web Token (JWT) and returns the decoded payload.
export function verifyToken(token: string) {
  return jwt.verify(token, SECRET_KEY);
}
