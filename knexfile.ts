import type { Knex } from 'knex';
import { knexSnakeCaseMappers } from 'objection';
import {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
} from './src/env';

const knexConfig: Knex.Config = {
  client: 'pg',
  connection: {
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
  },
  migrations: {
    extension: 'ts',
  },
  ...knexSnakeCaseMappers(),
};

export default knexConfig;
