import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from './database';
import { users, insertUserSchema, User, InsertUser } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key-change-this-in-production';
const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '7d'; // Token expires in 7 days

/**
 * Register a new user
 */
export async function registerUser(userData: InsertUser): Promise<{ user: User; token: string }> {
  // Hash the password
  const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
  
  // Create user with hashed password
  const [user] = await db.insert(users).values({
    ...userData,
    password: hashedPassword
  }).returning();
  
  // Generate JWT token
  const token = generateToken(user);
  
  // Return user (without password) and token
  const { password, ...userWithoutPassword } = user;
  return { 
    user: userWithoutPassword as User, 
    token 
  };
}

/**
 * Login a user with email/username and password
 */
export async function loginUser(
  emailOrUsername: string, 
  password: string
): Promise<{ user: User; token: string }> {
  // Check if input is email or username
  const isEmail = emailOrUsername.includes('@');
  
  // Find user by email or username
  const [user] = isEmail 
    ? await db.select().from(users).where(eq(users.email, emailOrUsername)).limit(1)
    : await db.select().from(users).where(eq(users.username, emailOrUsername)).limit(1);
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }
  
  // Update last login timestamp
  await db.update(users)
    .set({ lastLogin: new Date() })
    .where(eq(users.id, user.id));
  
  // Generate JWT token
  const token = generateToken(user);
  
  // Return user (without password) and token
  const { password: _, ...userWithoutPassword } = user;
  return { 
    user: userWithoutPassword as User, 
    token 
  };
}

/**
 * Generate a JWT token for a user
 */
function generateToken(user: User): string {
  return jwt.sign(
    { 
      userId: user.id,
      username: user.username,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

/**
 * Verify a JWT token and return the decoded payload
 */
export function verifyToken(token: string): jwt.JwtPayload & { userId: number } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as (jwt.JwtPayload & { userId: number });
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Authentication middleware for Express
 */
export const authenticateToken = (req: any, res: any, next: any) => {
  // Get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required' });
  }
  
  try {
    // Verify token and attach user to request
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Optional authentication middleware - doesn't require authentication but
 * adds user info to request if token is present
 */
export const optionalAuthenticateToken = (req: any, res: any, next: any) => {
  // Get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
  
  if (token) {
    try {
      // Verify token and attach user to request
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (error) {
      // Continue without setting req.user
    }
  }
  
  next();
};