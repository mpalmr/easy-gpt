import express, { ErrorRequestHandler } from 'express';
import Router from 'express-promise-router';
import { createValidator, ExpressJoiInstance } from 'express-joi-validation';
import type { ServerDeps } from '../server';
import authenticationRoutes from './authentication';
import applyUserRoutes from './user';

export interface RouteDeps extends ServerDeps {
  validator: ExpressJoiInstance;
}

export type ApplyRoutes = (router: ReturnType<typeof Router>, deps: RouteDeps) => void;

export default function createRouter(serverDeps: ServerDeps) {
  const router = Router();
  router.use(express.json());

  const deps = {
    ...serverDeps,
    validator: createValidator({ passError: true }),
  };

  // Apply routes
  [
    authenticationRoutes,
    applyUserRoutes,
  ]
    .forEach((applyRoutes) => {
      applyRoutes(router, deps);
    });

  // Error handler for invalid requests (400 errors)
  router.use(((ex, req, res, next) => {
    if (!ex?.error?.isJoi) next(ex);
    else {
      res.status(400).json({
        type: ex.type,
        message: ex.error.toString(),
      });
    }
  }) as ErrorRequestHandler);

  return router;
}
