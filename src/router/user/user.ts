import Joi from 'joi';
import argon from 'argon2';
import type { ApplyRoutes } from '..';

const userRoutes: ApplyRoutes = function applyRoutes(router, { knex, validator }) {
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

        await knex('userVerifications')
          .insert({ userId })
          .returning('id')
          .then(([{ id }]) => id);

        // await email.verify({ verifyUrl: `http://localhost:8080/verify-email/${verificationToken}` });
      });

      res.sendStatus(201);
    },
  );
};

export default userRoutes;
