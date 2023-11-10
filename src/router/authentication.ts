import Joi from 'joi';
import argon from 'argon2';
import { validate, authenticated } from '../middleware';
import type { ApplyRoutes } from '.';

const authenticationRoutes: ApplyRoutes = function authenticationRoutes(router, { knex }) {
  router.post(
    '/login',
    authenticated(true),

    validate('body', Joi.object({
      email: Joi.string().trim().required(),
      password: Joi.string().required(),
    })
      .required()),

    async (req, res) => {
      const user = await knex('users')
        .innerJoin('userVerifications', 'userVerifications.userId', 'users.id')
        .where('users.email', req.body.email)
        .whereNotNull('userVerifications.verifiedAt')
        .select('users.id', 'users.passwordHash')
        .orderBy('createdAt', 'desc')
        .first();

      if (!!user && await argon.verify(user.passwordHash, req.body.password)) {
        Object.assign(req.session, {
          user: {
            id: user.id,
            email: user.email,
          },
        });

        res.json({
          userId: user.id,
          email: user.email,
        });
      } else res.sendStatus(401);
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
