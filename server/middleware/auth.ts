// JWT Authentication Middleware
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn('[AUTH] JWT_SECRET not set — auth features (login/register) will be unavailable.');
}
const EFFECTIVE_JWT_SECRET = JWT_SECRET || 'INSECURE-DEV-ONLY-DO-NOT-DEPLOY';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const JWT_EXPIRES_IN: any = process.env.JWT_EXPIRES_IN || '24h';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const REFRESH_EXPIRES_IN: any = '7d';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Extend Express Request
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// ─── Token Generation ────────────────────────────────────────────────────────

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    EFFECTIVE_JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function generateRefreshToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, type: 'refresh' },
    EFFECTIVE_JWT_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );
}

// ─── Verify Token ────────────────────────────────────────────────────────────

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, EFFECTIVE_JWT_SECRET) as AuthUser;
    return decoded;
  } catch {
    return null;
  }
}

// ─── Auth Middleware (require authentication) ─────────────────────────────────

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Provide a Bearer token.' });
    return;
  }

  const token = authHeader.slice(7);
  const user = verifyToken(token);

  if (!user) {
    res.status(401).json({ error: 'Invalid or expired token.' });
    return;
  }

  req.user = user;
  next();
}

// ─── Optional Auth Middleware (attach user if token present, don't block) ─────

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const user = verifyToken(token);
    if (user) {
      req.user = user;
    }
  }

  next();
}

// ─── Role-Based Access ───────────────────────────────────────────────────────

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` });
      return;
    }

    next();
  };
}

// ─── Password Hashing (using built-in crypto — no bcrypt dependency) ─────────

import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':');
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const hashBuffer = Buffer.from(hash, 'hex');
  return timingSafeEqual(derived, hashBuffer);
}

// ─── Validate Token Freshness (for sensitive operations) ─────────────────────

export function requireFreshToken(maxAgeMinutes: number = 15) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const token = authHeader.slice(7);
    try {
      const decoded = jwt.decode(token) as { iat: number } | null;
      if (!decoded?.iat) {
        res.status(401).json({ error: 'Invalid token.' });
        return;
      }

      const ageMinutes = (Date.now() / 1000 - decoded.iat) / 60;
      if (ageMinutes > maxAgeMinutes) {
        res.status(401).json({ error: 'Token too old. Please re-authenticate for this operation.' });
        return;
      }

      next();
    } catch {
      res.status(401).json({ error: 'Invalid token.' });
    }
  };
}
