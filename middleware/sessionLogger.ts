import { Request, Response, NextFunction } from 'express';

//Logger i terminalen i vscode
const sessionLogger = (req: Request, res: Response, next: NextFunction) => {
  console.log('Session data:', req.session);
  next();
};

export default sessionLogger;
