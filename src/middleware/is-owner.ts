import type { RequestHandler } from 'express';
import type { Knex } from 'knex';

export default function isOwner(knex: Knex, table: string, key = 'userId'): RequestHandler {
  return async (req, res, next) => {
    const userId = await knex(table)
      .select(key)
      .where('id', req.session.userId)
      .first()
      .then((record) => record?.userId);

    if (userId !== req.session.userId) res.sendStatus(403);
    else next();
  };
}
