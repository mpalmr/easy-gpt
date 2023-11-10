import request from 'supertest';
import createTestServer, { TestServices } from '../../../test/services';

let testServices: TestServices;
let userId: string;

beforeAll(async () => {
  testServices = await createTestServer();
  // Create a user to associate with conversations
  const [user] = await testServices.knex('users').insert({
    email: 'user@example.com',
    passwordHash: 'hashedpassword',
  }).returning(['id']);
  userId = user.id;
});

beforeEach(async () => {
  await testServices.knex('conversations').delete();
});

describe('Conversation Routes', () => {
  test('POST /conversations creates a new conversation', async () => {
    const label = 'New Conversation';
    const response = await request(testServices.server)
      .post('/api/conversations')
      .send({ label })
      .set('Cookie', `sessionId=${userId}`) // Assuming sessionId is used for authentication
      .expect(201);

    expect(response.status).toBe(201);
    expect(response.body.conversation).toBeDefined();
    expect(response.body.conversation.label).toBe(label);

    // Check for the existence of the conversation in the database
    const conversation = await testServices.knex('conversations')
      .where({ userId, label })
      .first();
    expect(conversation).toBeDefined();
  });

  test('GET /conversations retrieves a list of conversations for the user', async () => {
    // Insert conversations to test against
    await testServices.knex('conversations').insert([
      { userId, label: 'Conversation 1' },
      { userId, label: 'Conversation 2' },
    ]);

    const response = await request(testServices.server)
      .get('/api/conversations')
      .set('Cookie', `sessionId=${userId}`) // Assuming sessionId is used for authentication
      .expect(200);

    expect(response.status).toBe(200);
    expect(response.body.conversations).toBeDefined();
    expect(response.body.conversations.length).toBe(2);
    expect(response.body.conversations[0].label).toBe('Conversation 1');
    expect(response.body.conversations[1].label).toBe('Conversation 2');
  });

  test('GET /conversations returns 404 if no conversations exist', async () => {
    const response = await request(testServices.server)
      .get('/api/conversations')
      .set('Cookie', `sessionId=${userId}`) // Assuming sessionId is used for authentication
      .expect(404);

    expect(response.status).toBe(404);
  });
});
