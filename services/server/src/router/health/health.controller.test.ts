import { HealthController } from './health.controller';

describe('Health Controller', () => {
  const healthController = new HealthController();

  it('get', () => {
    expect(healthController.get()).toEqual({ status: 'healthy' });
  });
});
