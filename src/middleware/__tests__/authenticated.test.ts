import type { Request, Response, NextFunction } from 'express';
import authenticated from '../authenticated';

test('by default there is no user on the session respond with 403', () => {
  const mockReq = ({
    session: {},
  } as unknown) as Request;

  const mockRes = ({ sendStatus: jest.fn() } as unknown) as Response;
  const mockNext = jest.fn() as NextFunction;

  expect(authenticated()(mockReq, mockRes, mockNext)).toBeUndefined();
  expect(mockRes.sendStatus).toHaveBeenCalledWith(403);
  expect(mockNext).not.toHaveBeenCalled();
});

test('when inversed if there is a user on the session respond with a 401 response', () => {
  const mockReq = ({
    session: { userId: 'mockUserId' },
  } as unknown) as Request;

  const mockRes = ({ sendStatus: jest.fn() } as unknown) as Response;
  const mockNext = jest.fn() as NextFunction;

  expect(authenticated(true)(mockReq, mockRes, mockNext)).toBeUndefined();
  expect(mockRes.sendStatus).toHaveBeenCalledWith(401);
  expect(mockNext).not.toHaveBeenCalled();
});

test('calls next() if not inversed and req.session.userId exists', () => {
  const mockReq = ({
    session: { userId: 'mockUserId' },
  } as unknown) as Request;

  const mockRes = ({ sendStatus: jest.fn() } as unknown) as Response;
  const mockNext = jest.fn() as NextFunction;

  expect(authenticated()(mockReq, mockRes, mockNext)).toBeUndefined();
  expect(mockRes.sendStatus).not.toHaveBeenCalled();
  expect(mockNext).toHaveBeenCalledWith();
});

test('calls next() if inversed and req.session.userId does not exist', () => {
  const mockReq = ({
    session: {},
  } as unknown) as Request;

  const mockRes = ({ sendStatus: jest.fn() } as unknown) as Response;
  const mockNext = jest.fn() as NextFunction;

  expect(authenticated(true)(mockReq, mockRes, mockNext)).toBeUndefined();
  expect(mockRes.sendStatus).not.toHaveBeenCalled();
  expect(mockNext).toHaveBeenCalledWith();
});
