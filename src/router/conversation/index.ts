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
      .select('id', 'label', 'createdAt')
      .where('userId', req.session.userId)
      .orderBy('createdAt', 'desc');

    res.json({ conversations });
  });

  router.get(
    '/conversations/:conversationId',
    authenticated(),
    conversationIdParamsValidator,

    async (req, res) => {
      const conversation = await knex.raw(`
        SELECT
          id,
          label,
          created_at,
          (
            SELECT json_agg(conversation_messages.* ORDER BY created_at DESC)
            FROM conversation_messages
            WHERE conversations.id = conversation_messages.conversation_id
          ) AS messages
        FROM conversations
        WHERE id = ?
        ORDER BY created_at DESC
      `, [req.params.conversationId]);

      if (!conversation) res.sendStatus(404);
      else res.json({ conversation });
    },
  );

  router.post(
    '/conversations',
    authenticated(),

    validate('body', Joi.object({
      label: Joi.string().trim().required(),
      temperature: Joi.number().positive(),
      message: Joi.string().trim().required(),
    })
      .required()),

    async (req, res) => {
      const conversation = await knex.transaction(async (trx) => {
        const [conversationRecord] = await trx('conversations')
          .insert({
            userId: req.session.userId!,
            label: req.body.label,
            temperature: req.body.temperature,
          })
          .returning([
            'id',
            'label',
            'temperature',
            'createdAt',
          ]);

        const [message] = await trx('conversationMessages')
          .insert({
            conversationId: conversationRecord.id,
            role: 'SYSTEM',
            content: req.body.message,
          })
          .returning([
            'id',
            'role',
            'content',
            'updatedAt',
            'createdAt',
          ]);

        return {
          ...conversationRecord,
          messages: [message],
        };
      });

      res.status(201).json({ conversation });
    },
  );

  router.patch(
    '/conversations/:conversationId',
    authenticated(),
    conversationIdParamsValidator,

    validate('body', Joi.object({
      label: Joi.string().trim(),
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
        res.json({
          conversation: await knex.transaction(async (trx) => {
            const updateSql = trx('conversations')
              .where('id', req.params.conversationId)
              .update('updatedAt', new Date());

            if (req.body.label) updateSql.update('label', req.body.label);
            await updateSql;

            return trx('conversations')
              .select('id', 'label', 'createdAt')
              .where('id', req.params.conversationId)
              .first();
          }),
        });
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
