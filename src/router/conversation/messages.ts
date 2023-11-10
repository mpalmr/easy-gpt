import Joi from 'joi';
import { validate, authenticated } from '../../middleware';
import type { ApplyRoutes } from '..';

const conversationMessageRoutes: ApplyRoutes = function conversationMessageRoutes(
  router,
  { knex },
) {
  const validateMessageIdParam = validate('params', Joi.object({
    messageId: Joi.string().uuid().required(),
  })
    .required());

  router.post(
    '/conversations/messages',
    authenticated(),

    validate('body', Joi.object({
      conversationId: Joi.string().uuid().required(),
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

  router.patch(
    '/conversations/messages/:messageId',
    authenticated(),
    validateMessageIdParam,

    validate('body', Joi.object({
      role: Joi.string().valid('SYSTEM', 'USER', 'ASSISTANT'),
      content: Joi.string().trim(),
    })
      .required()),

    async (req, res) => {
      const ownerUserIdRecord = await knex('conversations')
        .innerJoin(
          'conversationMessages',
          'conversationMessages.conversationId',
          'conversations.id',
        )
        .select('conversations.userId')
        .where('conversationMessages.id', req.params.messageId)
        .first();

      if (!ownerUserIdRecord) res.sendStatus(404);
      else if (ownerUserIdRecord.userId !== req.session.userId) res.sendStatus(403);
      else {
        res.json({
          message: await knex.transaction(async (trx) => {
            const updateSql = trx('conversationMessages')
              .where('id', req.params.messageId)
              .update('updatedAt', new Date());

            if (req.body.role) updateSql.update('role', req.body.role);
            if (req.body.content) updateSql.update('content', req.body.content);
            await updateSql;

            return trx('conversationMessages')
              .select('id', 'label', 'createdAt')
              .where('id', req.params.messageId)
              .first();
          }),
        });
      }
    },
  );

  router.delete(
    '/conversations/messages/:messageId',
    authenticated(),
    validateMessageIdParam,

    async (req, res) => {
      const baseSql = knex('conversationMessages')
        .where('conversationMessages.id', req.params.messageId);

      const record = await baseSql.clone()
        .innerJoin('conversations', 'conversations.id', 'conversationMessages.conversationId')
        .select('conversations.userId')
        .first();

      if (!record) res.sendStatus(404);
      else if (record.userId !== req.session.userId) res.sendStatus(403);
      else {
        await baseSql.del();
        res.sendStatus(200);
      }
    },
  );
};

export default conversationMessageRoutes;
