import type { Request, Response, NextFunction } from 'express';
import type { Logger } from 'winston';
import defaultErrorHandler from '../default-error-handler';

const mockLogger = ({
  error: jest.fn(),
} as unknown) as Logger;

test('logs all errors', () => {
  const reqHandler = defaultErrorHandler(mockLogger);
  expect(mockLogger.error).not.toHaveBeenCalled();

  const mockEx = new Error('mock error');
  const mockReq = ({} as unknown) as Request;
  const mockNext = jest.fn() as NextFunction;

  const mockRes = ({
    headersSent: true,
  } as unknown) as Response;

  expect(reqHandler(mockEx, mockReq, mockRes, mockNext)).toBeUndefined();
  expect(mockLogger.error).toHaveBeenCalledTimes(1);
  expect(mockLogger.error).toHaveBeenCalledWith('Unhandled error:', mockEx);
});

test('calls next() when res.headersSent is true', () => {
  const mockEx = new Error('mock error');
  const mockReq = ({} as unknown) as Request;
  const mockNext = jest.fn() as NextFunction;

  const mockRes = ({
    headersSent: true,
  } as unknown) as Response;

  expect(defaultErrorHandler(mockLogger)(mockEx, mockReq, mockRes, mockNext)).toBeUndefined();
  expect(mockNext).toHaveBeenCalledWith(mockEx);
});

test('does not call next() when res.headersSent is false but instead sends a response', () => {
  const mockEx = new Error('mock error');
  const mockReq = ({} as unknown) as Request;
  const mockNext = jest.fn() as NextFunction;

  const mockResJson = jest.fn();
  const mockRes = ({
    headersSent: false,
    status: jest.fn().mockReturnValue({
      json: mockResJson,
    }),

  } as unknown) as Response;

  expect(defaultErrorHandler(mockLogger)(mockEx, mockReq, mockRes, mockNext)).toBeUndefined();
  expect(mockNext).not.toHaveBeenCalledWith(mockEx);
  expect(mockRes.status).toHaveBeenCalledWith(500);
  expect(mockResJson).toHaveBeenCalledWith(mockEx);
});
