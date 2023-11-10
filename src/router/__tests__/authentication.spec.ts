import request from 'supertest';
import argon from 'argon2';
import createTestServices, { TestServices } from '../../../test/services';

let testServices: TestServices;
beforeAll(async () => {
  testServices = await createTestServices();
});

afterAll(async () => {
  await testServices.knex.destroy();
});

describe('Validation', () => {
  describe('req.body.email', () => {
    test('required', async () => expect(
      request(testServices.server)
        .post('/api/login')
        .expect(400)
        .send({ password: 'P@ssw0rd' })
        .then((res) => res.body),
    )
      .resolves.toEqual({
        errors: { email: '"email" is required' },
      }));
  });

  describe('req.body.password', () => {
    test('req.body.password is required', async () => expect(
      request(testServices.server)
        .post('/api/login')
        .expect(400)
        .send({ email: 'you@example.com' })
        .then((res) => res.body),
    )
      .resolves.toEqual({
        errors: {
          password: '"password" is required',
        },
      }));
  });
});

test('can log in', async () => {
  await testServices.knex('users').insert({
    email: 'radman@example.com',
    passwordHash: await argon.hash('P@ssw0rd'),
  });

  await request(testServices.server)
    .post('/api/login')
    .expect(200)
    .send({
      email: 'radman@example.com',
      password: 'P@ssw0rd',
    })
    .then((res) => res.body);
});
