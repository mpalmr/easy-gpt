import type { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import validate from '../validate';

test('valid input', () => {
  const mockNext = jest.fn() as NextFunction;

  const mockResJson = jest.fn();
  const mockRes = ({
    status: jest.fn().mockReturnValue({ json: mockResJson }),
  } as unknown) as Response;

  const mockReq = ({
    body: {
      email: 'you@example.com',
      password: 'P@ssw0rd',
    },
  } as unknown) as Request;

  expect(validate('body', Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  })
    .required())(mockReq, mockRes, mockNext)).toBeUndefined();

  expect(mockRes.status).not.toHaveBeenCalled();
  expect(mockNext).toHaveBeenCalledTimes(1);
});

test('invalid input', () => {
  const mockNext = jest.fn() as NextFunction;

  const mockResJson = jest.fn();
  const mockRes = ({
    status: jest.fn().mockReturnValue({ json: mockResJson }),
  } as unknown) as Response;

  const mockReq = ({
    body: {
      email: 'you',
      password: 'P@ssw0rd',
    },
  } as unknown) as Request;

  expect(validate('body', Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  })
    .required())(mockReq, mockRes, mockNext)).toBeUndefined();

  expect(mockNext).not.toHaveBeenCalled();
  expect(mockRes.status).toHaveBeenCalledWith(400);
  expect(mockResJson).toHaveBeenCalledTimes(1);
  expect(mockResJson.mock.calls.at(0)?.at(0)?.error.message)
    .toBe('"email" must be a valid email');
});
