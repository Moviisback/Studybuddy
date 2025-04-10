import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        userId?: number;
        displayName?: string;
      };
    }
  }
}

// Client-side Firebase authentication
// Relies on client sending Firebase auth token in the Authorization header
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extract user information from the client-provided token
      // In a real implementation, you'd verify this token
      const token = authHeader.split('Bearer ')[1];
      const tokenData = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      
      if (tokenData && tokenData.user_id) {
        // Look up user in our database or create one if they don't exist
        let user = await storage.getUserByFirebaseUid(tokenData.user_id);
        
        if (!user) {
          // Create a new user in our database based on Firebase auth
          user = await storage.createUser({
            email: tokenData.email || '',
            username: tokenData.email ? tokenData.email.split('@')[0] : `user-${tokenData.user_id.substring(0, 8)}`,
            firebaseUid: tokenData.user_id,
            name: tokenData.name || tokenData.email?.split('@')[0] || 'User',
          });
        }
        
        // Set user info on the request
        req.user = {
          uid: tokenData.user_id,
          email: tokenData.email,
          displayName: tokenData.name,
          userId: user.id
        };
      }
    }
    
    // Continue to the next middleware even if no user is found
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    req.user = undefined;
    next();
  }
};

// Check if user is authenticated
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};