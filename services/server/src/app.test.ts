import supertest from 'supertest';
import app from './app';

const testCases = ['/health'];

describe('app', () => {
  test.each(testCases)('GET %s has status code = 200', async (url) => {
    const response = await supertest(app).get(url);
    expect(response.statusCode).toBe(200);
  });
});
