import Joi from 'joi';
import { DateTime } from 'luxon';
import { validate, authenticated } from '../../middleware';
import type { ApplyRoutes } from '..';

const userVerificationRoutes: ApplyRoutes = function userVerificationRoutes(router, { knex }) {
  router.post(
    '/users/verify/:token',
    authenticated(true),

    validate('params', Joi.object({
      token: Joi.string().required(),
    })
      .required()),

    async (req, res) => {
      const isValidToken = await knex('userVerifications')
        .where('id', req.params.token)
        .whereNull('verifiedAt')
        .where('createdAt', '>', DateTime.now().plus({ hours: 4 }).toJSDate())
        .orderBy('createdAt', 'desc')
        .first()
        .then(Boolean);

      if (!isValidToken) res.sendStatus(404);
      else {
        await knex('userVerifications')
          .update({ verifiedAt: new Date() })
          .where('id', req.params.token);

        res.sendStatus(200);
      }
    },
  );

  // TODO
  router.post(
    '/users/verify/resend',
    authenticated(true),

    validate('params', Joi.object({
      email: Joi.string().trim().email().required(),
    })
      .required()),

    async (req, res) => {
      const isEligible = await knex('userVerifications')
        .innerJoin('users', 'users.id', 'userVerifications.userId')
        .where('users.email', req.body.email)
        .whereNotNull('userVerifications.verifiedAt')
        .first()
        .then(Boolean);

      if (!isEligible) res.sendStatus(403);
      else {
        await knex('userVerifications')
          .select('userId');
        // .where('id', )

        // await knex.transaction(async (trx) => {
        // await trx('userVerifications')
        //   .insert({})
        // });
      }
    },
  );
};

export default userVerificationRoutes;
