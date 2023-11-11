import type { RequestHandler } from 'express';

export default function authenticated(): RequestHandler {
  return (req, res, next) => {
    if (!req.session.userId) res.sendStatus(401);
    else next();
  };
}
