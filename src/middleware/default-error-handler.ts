import type { ErrorRequestHandler } from 'express';
import type { Logger } from 'winston';
import { NODE_ENV } from '../env';

export default function defaultErrorHandler(logger: Logger): ErrorRequestHandler {
  return (ex, req, res, next) => {
    logger.error('Unhandled error:', ex);
    if (res.headersSent) next(ex);
    else if (NODE_ENV === 'production') res.sendStatus(500);
    else res.status(500).json(ex);
  };
}
