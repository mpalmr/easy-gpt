import Joi from 'joi';
import argon from 'argon2';
import { validate, authenticated } from '../middleware';
import type { ApplyRoutes } from '.';

const authenticationRoutes: ApplyRoutes = function authenticationRoutes(router, { knex }) {
  router.post(
    '/login',

    validate('body', Joi.object({
      email: Joi.string().trim().required(),
      password: Joi.string().required(),
    })
      .required()),

    async (req, res) => {
      const user = await knex('users')
        .where('email', req.body.email)
        .first();

      if (!(user && await argon.verify(user.passwordHash, req.body.password))) {
        res.sendStatus(401);
      } else {
        Object.assign(req.session, {
          userId: user.id,
        });

        res.json({
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        });
      }
    },
  );

  router.post('/logout', authenticated(), async (req, res) => {
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.sendStatus(200);
  });
};

export default authenticationRoutes;
