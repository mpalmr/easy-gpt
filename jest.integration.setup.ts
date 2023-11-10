import createKnex, { Knex } from 'knex';
import knexConfig from './knexfile';

let knex: Knex;
beforeAll(async () => {
  knex = createKnex(knexConfig);
  await knex.migrate.rollback(undefined, true);
  await knex.migrate.latest();
});

afterAll(async () => {
  await knex.migrate.rollback(undefined, true);
  await knex.destroy();
});
