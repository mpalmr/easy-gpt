import 'express-session';
import type { UsersTable } from 'knex/types/tables';

declare module 'express-session' {
  interface SessionData {
    user?: Pick<UsersTable, 'id' | 'email'>;
  }
}
