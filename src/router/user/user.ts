import Joi from 'joi';
import argon from 'argon2';
import type { ApplyRoutes } from '..';
import { validate } from '../../middleware';

const userRoutes: ApplyRoutes = function applyRoutes(router, { knex }) {
  router.post(
    '/users',

    validate('body', Joi.object({
      email: Joi.string().trim().email().required(),
      password: Joi.string().min(6).required(),
    })
      .required()),

    async (req, res) => {
      await knex.transaction(async (trx) => {
        const userId = await trx('users')
          .insert({
            email: req.body.email,
            passwordHash: await argon.hash(req.body.password),
          })
          .returning('id')
          .then(([{ id }]) => id);

        await knex('userVerifications')
          .insert({ userId })
          .returning('id')
          .then(([{ id }]) => id);

        // await email.verify({ verifyUrl: `http://localhost:8080/verify-email/${verificationToken}` });
      });

      res.sendStatus(201);
    },
  );

  router.get(
    '/user/email/unique',

    validate('query', Joi.object({
      email: Joi.string().trim().email().required(),
    })
      .required()),

    async (req, res) => {
      res.json({
        isEmailUnique: await knex('users')
          .where('email', req.query.email)
          .first()
          .then(Boolean),
      });
    },
  );
};

export default userRoutes;
