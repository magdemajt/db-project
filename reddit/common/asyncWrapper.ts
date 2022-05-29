import express from 'express';
import User from 'models/User';
type ExpressHandler = (
  req: express.Request & { session: express.Request['session'] & { user?: User; } },
  res: express.Response,
  next: express.NextFunction,
) => Promise<void>;

export default function asyncWrapper(handler: ExpressHandler) {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}
