import type { ApplyRoutes } from '..';
import verificationRoutes from './verification';

const applyUserRoutes: ApplyRoutes = function applyUserRoutes(router, deps) {
  [
    verificationRoutes,
  ]
    .forEach((applyRoutes) => {
      applyRoutes(router, deps);
    });
};

export default applyUserRoutes;
