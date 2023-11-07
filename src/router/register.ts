import Joi from 'joi';
import argon from 'argon2';
import { DateTime } from 'luxon';
import type { ApplyRoutes } from '.';

const registerRoutes: ApplyRoutes = function registerRoutes(router, {
  email,
  validator,
  knex,
}) {
  router.post(
    '/users',

    validator.body(Joi.object({
      email: Joi.string().trim().email().required(),
      password: Joi.string().min(6).required(),
      openaiApiKey: Joi.string().required(),
    })
      .required()),

    async (req, res) => {
      await knex.transaction(async (trx) => {
        const userId = await trx('users')
          .insert({
            email: req.body.email,
            passwordHash: await argon.hash(req.body.password),
            openaiApiKey: req.body.openaiApiKey,
          })
          .returning('id')
          .then(([{ id }]) => id);

        const verificationToken = await trx('userVerifications')
          .insert({ userId })
          .returning('id')
          .then(([{ id }]) => id);

        await email.verify({ verifyUrl: `http://localhost:8080/verify-email/${verificationToken}` });
      });

      res.sendStatus(201);
    },
  );

  router.post(
    '/users/verify/:verificationToken',

    validator.params(Joi.object({
      verificationToken: Joi.string().uuid().required(),
    })
      .required()),

    async (req, res) => {
      const tokenRecord = await knex('userVerifications')
        .where('id', req.params.verificationToken)
        .whereNull('verifiedAt')
        .select('userId', 'createdAt')
        .first();

      if (!tokenRecord) res.sendStatus(404);
      else {
        const expiresAt = DateTime.fromJSDate(tokenRecord.createdAt).plus({ hours: 1 }).toJSDate();
        if (Date.now() >= expiresAt.getTime()) res.sendStatus(404);
        else {
          await knex('userVerifications')
            .where('id', req.params.verificationToken)
            .update({ verifiedAt: new Date() });

          res.sendStatus(201);
        }
      }
    },
  );
};

export default registerRoutes;
