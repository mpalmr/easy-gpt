import createKnex from 'knex';
import knexConfig from '../knexfile';
import createLogger from '../src/logger';
import createEmail from '../src/email';
import createServer from '../src/server';

export default async function createTestServer() {
  const logger = createLogger();
  const email = await createEmail(logger);
  const knex = createKnex(knexConfig);
  const server = createServer({ logger, email, knex });

  return {
    logger,
    email,
    knex,
    server,
  };
}

export type TestServices = Awaited<ReturnType<typeof createTestServer>>;
