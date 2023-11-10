import nodemailer from 'nodemailer';
import { Logger } from 'winston';
import createEmail, { Emails } from '../index';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  }),
}));

// Mock the logger methods you use in the email service
const mockLogger = {
  log: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
} as unknown as Logger; // Type assertion to Logger

describe('Email Service', () => {
  let emailService: Emails;
  let mockSendMail: jest.Mock;

  beforeAll(async () => {
    emailService = await createEmail(mockLogger);
    const mockTransport = nodemailer.createTransport();
    mockSendMail = mockTransport.sendMail as jest.Mock;
  });

  beforeEach(() => {
    mockSendMail.mockClear();
  });

  test('verify method sends an email with the correct parameters', async () => {
    const verifyUrl = 'http://example.com/verify/123';
    await emailService.verify({ verifyUrl });

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: expect.any(String),
      html: expect.stringContaining(verifyUrl), // Check that the email body contains the verify URL
    }));
  });

  test('logs an error if the email fails to send', async () => {
    const error = new Error('Email failed to send');
    mockSendMail.mockRejectedValueOnce(error);

    await expect(emailService.verify({ verifyUrl: 'http://example.com/verify/123' }))
      .rejects.toThrow(error);

    expect(mockLogger.error).toHaveBeenCalledWith(expect.any(String), error);
  });
});
