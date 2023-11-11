import type { RequestHandler } from 'express';

export default function unauthenticated(): RequestHandler {
  return (req, res, next) => {
    if (req.session.userId) res.sendStatus(403);
    else next();
  };
}
