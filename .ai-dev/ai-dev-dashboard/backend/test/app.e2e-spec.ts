import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { join } from 'path';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

const FIXTURE_PATH = join(__dirname, 'fixtures', 'board.fixture.json');

describe('App E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.BOARD_DATA_PATH = FIXTURE_PATH;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    delete process.env.BOARD_DATA_PATH;
  });

  describe('GET /health', () => {
    it('returns status ok', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.timestamp).toBeDefined();
        });
    });
  });

  describe('GET /api/board', () => {
    it('returns 200 with correct JSON structure', () => {
      return request(app.getHttpServer())
        .get('/api/board')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('metadata');
          expect(res.body).toHaveProperty('stories');
          expect(res.body).toHaveProperty('releases');
          expect(res.body).toHaveProperty('metrics');
          expect(res.body.metadata.atomic_stories_version).toBe('v1.4.0');
        });
    });
  });

  describe('GET /api/stories', () => {
    it('returns 200 array of all stories', () => {
      return request(app.getHttpServer())
        .get('/api/stories')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(3);
        });
    });

    it('filters by version=v1.4.0', () => {
      return request(app.getHttpServer())
        .get('/api/stories?version=v1.4.0')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(1);
          expect(res.body[0].id).toBe('318');
        });
    });

    it('filters by status=pending', () => {
      return request(app.getHttpServer())
        .get('/api/stories?status=pending')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(1);
          expect(res.body[0].status).toBe('pending');
        });
    });
  });

  describe('GET /api/releases', () => {
    it('returns 200 array of releases', () => {
      return request(app.getHttpServer())
        .get('/api/releases')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(1);
          expect(res.body[0].version).toBe('v1.0.0');
        });
    });
  });

  describe('GET /api/metrics', () => {
    it('returns 200 with metrics including suggestions', () => {
      return request(app.getHttpServer())
        .get('/api/metrics')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('total_stories');
          expect(res.body).toHaveProperty('suggestions');
          expect(Array.isArray(res.body.suggestions)).toBe(true);
          expect(res.body.suggestions).toHaveLength(1);
        });
    });
  });
});
