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
      await knex('users')
        .insert({
          email: req.body.email,
          passwordHash: await argon.hash(req.body.password),
        })
        .returning('id')
        .then(([{ id }]) => id);

      res.sendStatus(201);
    },
  );
};

export default userRoutes;
