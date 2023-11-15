import Joi from 'joi';
import { validate, authenticated } from '../../middleware';
import type { ApplyRoutes } from '..';

const DEFAULT_SELECT_FIELDS = [
  'id',
  'conversationId',
  'prompt',
  'promptUpdatedAt',
  'response',
  'responseUpdatedAt',
  'createdAt',
];

const conversationMessageRoutes: ApplyRoutes = function conversationMessageRoutes(
  router,
  { knex },
) {
  const validateMessageIdParam = validate('params', Joi.object({
    messageId: Joi.string().uuid().required(),
  })
    .required());

  router.post(
    '/conversations/:conversationId/messages',
    authenticated(),

    validate('params', Joi.object({
      conversationId: Joi.string().uuid().required(),
    })
      .required()),

    validate('body', Joi.object({
      conversationId: Joi.string().uuid().required(),
      prompt: Joi.string().trim().required(),
    })
      .required()),

    async (req, res) => {
      const [message] = await knex('conversationMessages')
        .insert({
          conversationId: req.params.conversationId,
          prompt: req.body.prompt,
          response: 'ayyy',
        })
        .returning(DEFAULT_SELECT_FIELDS);

      res.status(201).json({ message });
    },
  );

  router.patch(
    '/conversations/messages/:messageId',
    authenticated(),
    validateMessageIdParam,

    validate('body', Joi.object({
      prompt: Joi.string().trim(),
      response: Joi.string().trim(),
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
              .where('id', req.params.messageId);

            const now = new Date();
            if (req.body.prompt) {
              updateSql
                .update('prompt', req.body.prompt)
                .update('promptUpdatedAt', now);
            }
            if (req.body.response) {
              updateSql
                .update('response', req.body.response)
                .update('responseUpdatedAt', now);
            }
            await updateSql;

            return trx('conversationMessages')
              .select(...DEFAULT_SELECT_FIELDS)
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
