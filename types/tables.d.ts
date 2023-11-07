import type { Knex } from 'knex';

type WriteRecord<T> = Omit<T, 'id' | 'createdAt'>;

declare module 'knex/types/tables' {
  interface UsersTable {
    readonly id: string;
    readonly email: string;
    passwordHash: string;
    openaiApiKey: string;
    readonly createdAt: Date;
  }

  interface UserVerificationsTable {
    readonly id: string;
    readonly userId: string;
    verifiedAt?: Date;
    readonly createdAt: Date;
  }

  interface Tables {
    users: Knex.CompositeTableType<
    UsersTable,
    WriteRecord<UsersTable>,
    Omit<WriteRecord<UsersTable, 'email'>>
    >;

    userVerifications: Knex.CompositeTableType<
    UserVerificationsTable,
    WriteRecord<UserVerificationsTable>,
    Omit<WriteRecord<UserVerificationsTable>, 'userId'>
    >;
  }
}
