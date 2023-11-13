import type { Knex } from 'knex';

type WriteRecord<T> = Omit<T, 'id' | 'createdAt'>;

declare module 'knex/types/tables' {
  interface UsersTable {
    readonly id: string;
    readonly email: string;
    passwordHash: string;
    readonly createdAt: Date;
  }

  interface UserVerificationsTable {
    readonly id: string;
    readonly userId: string;
    verifiedAt?: Date;
    readonly createdAt: Date;
  }

  interface ConversationsTable {
    readonly id: string;
    readonly userId: string;
    label: string;
    systemPrompt: string
    temperature: number;
    readonly createdAt: Date;
  }

  interface ConversationMessagesTable {
    readonly id: string;
    readonly conversationId: string;
    prompt: string;
    response: string;
    promptUpdatedAt?: Date;
    responseUpdatedAt?: Date;
    readonly createdAt: Date;
  }

  interface Tables {
    users: Knex.CompositeTableType<
    UsersTable,
    WriteRecord<UsersTable>,
    Omit<WriteRecord<UsersTable, 'email'>>,
    >;

    userVerifications: Knex.CompositeTableType<
    UserVerificationsTable,
    WriteRecord<UserVerificationsTable>,
    Omit<WriteRecord<UserVerificationsTable>, 'userId'>,
    >;

    conversations: Knex.CompositeTableType<
    ConversationsTable,
    WriteRecord<ConversationsTable>,
    Omit<WriteRecord<ConversationsTable>, 'userId'>,
    >;

    conversationMessages: Knex.CompositeTableType<
    ConversationMessagesTable,
    Omit<WriteRecord<ConversationMessagesTable>, 'updatedAt'>,
    Omit<WriteRecord<ConversationMessagesTable>, 'conversationId' | 'role'>,
    >;
  }
}
