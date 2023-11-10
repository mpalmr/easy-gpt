import request from 'supertest';
import argon from 'argon2';
import createTestServices, { TestServices } from '../../../../test/services';

let testServices: TestServices;
beforeAll(async () => {
  testServices = await createTestServices();

  await testServices.knex('users').insert({
    email: 'alexislame@example.com',
    passwordHash: await argon.hash('P@ssw0rd'),
  });
});

afterEach(async () => {
  await testServices.knex.destroy();
});

describe('GET /conversations', () => {
  test('requires user to be authenticated', async () => expect(
    request(testServices.server)
      .get('/api/conversations')
      .expect(401)
      .send()
      .then((res) => res.body),
  )
    .resolves.toEqual({}));
});
