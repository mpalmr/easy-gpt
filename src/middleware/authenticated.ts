import type { RequestHandler } from 'express';

export default function authenticated(inverse = false): RequestHandler {
  return (req, res, next) => {
    if (!inverse && !req.session.userId) res.sendStatus(403);
    else if (inverse && req.session.userId) res.sendStatus(401);
    else next();
  };
}
