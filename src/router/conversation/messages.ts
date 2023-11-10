import Joi from 'joi';
import { validate, authenticated } from '../../middleware';
import type { ApplyRoutes } from '..';

const conversationMessageRoutes: ApplyRoutes = function conversationMessageRoutes(
  router,
  { knex },
) {
  router.post(
    '/conversations/:conversationId/messages',
    authenticated(),

    validate('params', Joi.object({
      conversationId: Joi.string().uuid().required(),
    })
      .required()),

    validate('body', Joi.object({
      role: Joi.string().valid('SYSTEM', 'USER', 'ASSISTANT').required(),
      content: Joi.string().trim(),
    })
      .required()),

    async (req, res) => {
      const message = await knex('conversationMessages')
        .insert({
          conversationId: req.params.conversationId,
          role: req.body.role,
          content: req.body.content,
        })
        .returning([
          'id',
          'conversationId',
          'role',
          'content',
          'updatedAt',
          'createdAt',
        ])
        .then(([a]) => a);

      res.status(201).json({ message });
    },
  );
};

export default conversationMessageRoutes;
