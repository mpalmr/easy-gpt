import type { ApplyRoutes } from '..';
import userRoutes from './user';
import verificationRoutes from './verification';

const applyUserRoutes: ApplyRoutes = function applyUserRoutes(router, deps) {
  [
    userRoutes,
    verificationRoutes,
  ]
    .forEach((applyRoutes) => {
      applyRoutes(router, deps);
    });
};

export default applyUserRoutes;
