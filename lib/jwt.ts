import jwt from 'jsonwebtoken';

// Secret key for JWT from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// User type definition
export interface UserType {
  id: string;
  email: string;
}

// Generate a JWT token
export function generateToken(user: UserType): string {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verify a JWT token
export function verifyToken(token: string): UserType | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    return {
      id: decoded.id,
      email: decoded.email
    };
  } catch (error) {
    return null;
  }
}
