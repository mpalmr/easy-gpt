import request from 'supertest';
import argon from 'argon2';
import createTestServer, { TestServices } from '../../../../test/services';

let testServices: TestServices;

beforeAll(async () => {
  testServices = await createTestServer();
});

afterAll(async () => {
  await testServices.knex.destroy();
});

describe('User Routes', () => {
  beforeEach(async () => {
    await testServices.knex('users').delete();
    await testServices.knex('userVerifications').delete();
  });

  test('POST /users creates a new user and responds with 201', async () => {
    const userData = {
      email: 'newuser@example.com',
      password: 'password123',
    };

    const response = await request(testServices.server)
      .post('/api/users')
      .send(userData)
      .expect(201);

    expect(response.status).toBe(201);

    // Verify that the user was created in the database
    const user = await testServices.knex('users')
      .where({ email: userData.email })
      .first();

    // Ensure that 'user' is defined before proceeding
    expect(user).toBeDefined();
    if (!user) throw new Error('User not found');

    expect(user.email).toBe(userData.email);
    expect(await argon.verify(user.passwordHash, userData.password)).toBe(true);

    // Verify that a verification entry was created
    const verification = await testServices.knex('userVerifications')
      .where({ userId: user.id })
      .first();
    expect(verification).toBeDefined();
  });

  test('GET /user/email/unique checks if an email is unique', async () => {
    const email = 'unique@example.com';
    // Insert a user to ensure the email is not unique
    await testServices.knex('users').insert({
      email,
      passwordHash: await argon.hash('password123'),
    });

    // Check for an existing email
    const responseExisting = await request(testServices.server)
      .get(`/api/user/email/unique?email=${encodeURIComponent(email)}`)
      .expect(200);

    expect(responseExisting.body.isEmailUnique).toBe(false);

    // Check for a non-existing email
    const responseNonExisting = await request(testServices.server)
      .get('/api/user/email/unique?email=nonexisting@example.com')
      .expect(200);

    expect(responseNonExisting.body.isEmailUnique).toBe(true);
  });
});
