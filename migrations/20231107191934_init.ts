import type { Knex } from 'knex';
import { MODELS } from '../src/constants';

export async function up(knex: Knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  await knex.schema
    .createTable('users', (table) => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table
        .string('email', 320)
        .notNullable()
        .unique();

      table
        .text('passwordHash')
        .notNullable();

      table
        .timestamp('createdAt')
        .notNullable()
        .defaultTo(knex.fn.now());
    })
    .createTable('userVerifications', (table) => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table
        .uuid('userId')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');

      table.timestamp('verifiedAt');

      table
        .timestamp('createdAt')
        .notNullable()
        .defaultTo(knex.fn.now());
    })
    .createTable('conversations', (table) => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table
        .uuid('userId')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');

      table
        .text('label')
        .notNullable();

      table
        .enum('model', MODELS, {
          useNative: true,
          enumName: 'gpt_model_option',
        })
        .notNullable()
        .defaultTo('gpt-3.5-turbo-16k-0613');

      table
        .text('systemPrompt')
        .notNullable()
        .defaultTo('You are an oracle');

      table
        .float('temperature')
        .unsigned()
        .notNullable()
        .defaultTo(0.1);

      table
        .timestamp('createdAt')
        .notNullable()
        .defaultTo(knex.fn.now());
    })
    .createTable('conversationMessages', (table) => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table
        .uuid('conversationId')
        .notNullable()
        .references('id')
        .inTable('conversations')
        .onDelete('CASCADE');

      table
        .text('prompt')
        .notNullable();

      table
        .text('response')
        .notNullable();

      table.timestamp('promptUpdatedAt');
      table.timestamp('responseUpdatedAt');

      table
        .timestamp('createdAt')
        .notNullable()
        .defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex) {
  await knex.schema
    .dropTableIfExists('conversationMessages')
    .dropTableIfExists('conversations')
    .dropTableIfExists('userVerifications')
    .dropTableIfExists('users');

  await knex.raw('DROP TYPE IF EXISTS gpt_model_option');
  await knex.raw('DROP TYPE IF EXISTS conversation_message_role');
  await knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
}
