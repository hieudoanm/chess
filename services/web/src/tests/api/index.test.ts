import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../pages/api';

describe('api / handler', () => {
  it('return status healthy', () => {
    const mockRequest = {} as NextApiRequest;
    const mockResponse = {} as NextApiResponse;
    mockResponse.status = jest.fn().mockReturnValue(mockResponse);
    mockResponse.json = jest.fn().mockReturnValue(mockResponse);
    handler(mockRequest, mockResponse);
    expect(mockResponse.status).toBeCalledWith(200);
    expect(mockResponse.json).toBeCalledWith({ status: 'healthy' });
  });
});
