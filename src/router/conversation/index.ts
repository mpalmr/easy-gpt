import type { ApplyRoutes } from '..';
import conversationRoutes from './conversation';

const applyConversationRoutes: ApplyRoutes = function applyConversationRoutes(router, deps) {
  [
    conversationRoutes,
  ]
    .forEach((applyRoutes) => {
      applyRoutes(router, deps);
    });
};

export default applyConversationRoutes;
