import express from 'express';

export default function auth(req: express.Request & { session: any }, res: express.Response, next: express.NextFunction) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).send('Not authorized');
}
