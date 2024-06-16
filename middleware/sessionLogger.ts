import { Request, Response, NextFunction } from 'express';

const sessionLogger = (req: Request, res: Response, next: NextFunction) => {
  console.log('Session data:', req.session);
  next();
};

export default sessionLogger;
