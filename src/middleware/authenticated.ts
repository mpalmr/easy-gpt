import type { RequestHandler } from 'express';

export default function authenticated(): RequestHandler {
  return (req, res, next) => {
    console.log(req.session);
    if (!req.session.userId) res.sendStatus(401);
    else next();
  };
}
