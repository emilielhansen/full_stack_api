import { Request, Response, NextFunction } from 'express';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if ((req.session as any).userId) {
    console.log('Authenticated user ID:', (req.session as any).userId);
    next();
  } else {
    console.log('Unauthorized access attempt');
    res.status(401).json({ error: 'Unauthorized' });
  }
};

export default authMiddleware;