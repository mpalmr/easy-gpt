import Joi from 'joi';
import type { ApplyRoutes } from '..';
import { validate, authenticated } from '../../middleware';

const conversationRoutes: ApplyRoutes = function conversationRoutes(router, { knex }) {
  const conversationIdParamsValidator = validate('params', Joi.object({
    conversationId: Joi.string().uuid().required(),
  })
    .required());

  router.get('/conversations', authenticated(), async (req, res) => {
    const conversations = await knex('conversations')
      .select('id', 'label', 'systemPrompt', 'temperature', 'createdAt')
      .where('userId', req.session.userId)
      .orderBy('createdAt', 'desc');

    res.json({ conversations });
  });

  router.get(
    '/conversations/:conversationId',
    authenticated(),
    conversationIdParamsValidator,

    async (req, res) => {
      const conversation = await Promise.all([
        knex('conversations')
          .select('id', 'label', 'systemPrompt', 'createdAt')
          .where('id', req.params.conversationId)
          .first(),

        knex('conversationMessages')
          .select('id', 'prompt', 'response', 'updatedAt', 'createdAt')
          .where('conversationId', req.params.conversationId)
          .orderBy('createdAt'),
      ])
        .then(([record, messages]) => ({ ...record, messages }));

      if (!conversation.id) res.sendStatus(404);
      else res.json(conversation);
    },
  );

  router.post(
    '/conversations',
    authenticated(),

    validate('body', Joi.object({
      label: Joi.string().trim().required(),
      systemPrompt: Joi.string().trim().required(),
      temperature: Joi.number().positive().max(2),
    })
      .required()),

    async (req, res) => {
      res.status(201).json(await knex('conversations')
        .insert({
          userId: req.session.userId!,
          label: req.body.label,
          systemPrompt: req.body.systemPrompt,
          temperature: req.body.temperature,
        })
        .returning([
          'id',
          'label',
          'systemPrompt',
          'temperature',
          'createdAt',
        ])
        .then(([a]) => a));
    },
  );

  router.patch(
    '/conversations/:conversationId',
    authenticated(),
    conversationIdParamsValidator,

    validate('body', Joi.object({
      label: Joi.string().trim(),
      systemPrompt: Joi.string().trim(),
      temperature: Joi.number().positive().max(2),
    })
      .required()),

    async (req, res) => {
      const ownerUserIdRecord = await knex('conversations')
        .where('id', req.params.conversationId)
        .select('userId')
        .first();

      if (!ownerUserIdRecord) res.sendStatus(404);
      else if (ownerUserIdRecord.userId !== req.session.userId) res.sendStatus(403);
      else {
        res.json(await knex.transaction(async (trx) => {
          const updateSql = trx('conversations')
            .where('id', req.params.conversationId)
            .update('updatedAt', new Date());

          if (req.body.label) updateSql.update('label', req.body.label);
          if (req.body.systemPrompt) updateSql.update('systemPrompt', req.body.systemPrompt);
          if (req.body.temperature) updateSql.update('temperature', req.body.temperature);
          await updateSql;

          return trx('conversations')
            .select('id', 'label', 'createdAt')
            .where('id', req.params.conversationId)
            .first();
        }));
      }
    },
  );

  router.delete(
    '/conversations/:conversationId',
    authenticated(),
    conversationIdParamsValidator,

    async (req, res) => {
      const baseSql = knex('conversations')
        .where('id', req.params.conversationId);

      const isOwner = await baseSql.clone()
        .select('userId')
        .first()
        .then((record) => !!record?.userId);

      if (!isOwner) res.sendStatus(403);
      else {
        await baseSql.del();
        res.sendStatus(200);
      }
    },
  );
};

export default conversationRoutes;
