import Joi from 'joi';
import argon from 'argon2';
import { DateTime } from 'luxon';
import type { ApplyRoutes } from '.';

const registerRoutes: ApplyRoutes = function registerRoutes(router, { email, validator, knex }) {
  async function dispatchVerificationToken(userId: string) {
    const token = await knex('userVerifications')
      .insert({ userId })
      .returning('id')
      .then(([{ id }]) => id);

    // await email.verify({ verifyUrl: `http://localhost:8080/verify-email/${verificationToken}` });
    return token;
  }

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

        await dispatchVerificationToken(userId);
      });

      res.sendStatus(201);
    },
  );

  router.post(
    '/users/:userId/resend-verification',

    validator.params(Joi.object({
      userId: Joi.string().uuid().required(),
    })
      .required()),

    async (req, res) => {
      const isEligible = await knex('userVerifications')
        .where('userId', req.params.userId)
        .whereNotNull('verifiedAt')
        .first()
        .then(Boolean);

      if (!isEligible) res.sendStatus(403);
      else {
        await dispatchVerificationToken(req.params.userId);
        res.sendStatus(200);
      }
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
        .orderBy('createdAt', 'desc')
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
