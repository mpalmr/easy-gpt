import createKnex from 'knex';
import knexConfig from '../knexfile';
import createLogger from './logger';
import createEmail from './email';
import createServer from './server';
import { HTTP_PORT } from './env';

const logger = createLogger();
createEmail(logger)
  .catch((ex) => {
    logger.error('Could not initalize email service:', ex);
    process.exit(1);
  })
  .then((email) => {
    const server = createServer({
      email,
      logger,
      knex: createKnex(knexConfig),
    });

    server.listen(HTTP_PORT, () => {
      logger.info('EasyGPT API is up~');
    });

    return server;
  })
  .catch((ex) => {
    logger.error('Could not initailize HTTP server:', ex);
    process.exit(1);
  });
