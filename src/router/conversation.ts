import Joi from 'joi';
import type { ApplyRoutes } from '.';
import { validate, authenticated } from '../middleware';

const conversationRoutes: ApplyRoutes = function conversationRoutes(router, { knex }) {
  router.get('/conversations', authenticated(), async (req, res) => {
    const conversations = await knex('conversations')
      .select('id', 'label', 'createdAt')
      .where('userId', req.session.userId)
      .orderBy('createdAt', 'desc');

    if (!conversations.length) res.sendStatus(404);
    else res.json({ conversations });
  });

  router.post(
    '/conversations',
    authenticated(),

    validate('body', Joi.object({
      label: Joi.string().trim().required(),
    })
      .required()),

    async (req, res) => {
      const conversation = await knex('conversations')
        .insert({
          userId: req.session.userId!,
          label: req.body.label,
        })
        .returning(['id', 'label', 'createdAt'])
        .then(([a]) => a);

      res.status(201).json({ conversation });
    },
  );
};

export default conversationRoutes;
