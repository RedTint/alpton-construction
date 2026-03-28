import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('returns status ok with a timestamp', () => {
    const before = new Date().toISOString();
    const result = controller.check();
    const after = new Date().toISOString();

    expect(result.status).toBe('ok');
    expect(result.timestamp).toBeDefined();
    expect(result.timestamp >= before).toBe(true);
    expect(result.timestamp <= after).toBe(true);
  });
});
