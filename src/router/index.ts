import express from 'express';
import Router from 'express-promise-router';
import type { ServerDeps } from '../server';
import authenticationRoutes from './authentication';
import applyUserRoutes from './user';

import conversationRoutes from './conversation';
import conversationMessageRoutes from './conversation/messages';

export type RouteDeps = ServerDeps;

export type ApplyRoutes = (router: ReturnType<typeof Router>, deps: RouteDeps) => void;

export default function createRouter(deps: ServerDeps) {
  const router = Router();
  router.use(express.json());

  [
    authenticationRoutes,
    applyUserRoutes,
    conversationRoutes,
    conversationMessageRoutes,
  ]
    .forEach((applyRoutes) => {
      applyRoutes(router, deps as RouteDeps);
    });

  return router;
}
