import type { RequestHandler } from 'express';
import type { Schema } from 'joi';

export default function validate(
  property: 'body' | 'params' | 'query',
  schema: Schema,
): RequestHandler {
  return (req, res, next) => {
    const { error } = schema.validate(req[property]);
    if (error) {
      res.status(400).json({
        errors: Object.fromEntries(error.details
          .map((detail) => [detail.path.at(0), detail.message])),
      });
    } else next();
  };
}
