import express from 'express';
import helmet from 'helmet';
import session from 'express-session';
import createConnectSession from 'connect-session-knex';
import type { Knex } from 'knex';
import type { Logger } from 'winston';
import router from './router';
import { defaultErrorHandler } from './middleware';
import type createEmail from './email';
import { HTTP_SESSION_SECRET, NODE_ENV } from './env';

export interface ServerDeps {
  knex: Knex;
  logger: Logger;
  email: Awaited<ReturnType<typeof createEmail>>;
}

export default function createServer(deps: ServerDeps) {
  const { knex, logger } = deps;

  const server = express();
  server.use(helmet());

  const SessionStore = createConnectSession(session);
  server.use(session({
    secret: HTTP_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new SessionStore({ knex }),
    cookie: {
      maxAge: 1_200_000, // 20mins
      httpOnly: true,
      secure: NODE_ENV === 'production',
    },
  }));

  server.use(router(deps));
  server.use((req, res) => res.sendStatus(404));
  server.use(defaultErrorHandler(logger));
  return server;
}
