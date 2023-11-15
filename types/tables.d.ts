import type { User, Conversation, ConversationMessage } from '@easy-gpt/types';
import type { Knex } from 'knex';

type WriteRecord<T> = Omit<T, 'id' | 'createdAt'>;

declare module 'knex/types/tables' {
  interface UsersTable extends User {
    passwordHash: string;
  }

  interface UserVerificationsTable {
    readonly id: string;
    readonly userId: string;
    verifiedAt?: Date;
    readonly createdAt: Date;
  }

  interface ConversationsTable extends Omit<Conversation, 'messages'> {
    readonly userId: string;
  }

  interface ConversationMessagesTable extends ConversationMessage {
    readonly conversationId: string;
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
