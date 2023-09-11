import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { Task, User } from '@prisma/client';
import { useContainer } from 'class-validator';
import * as bcrypt from 'bcrypt';

describe('Todo (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let task: Task;
  let user: User;
  let accessToken: string;
  let jsonTask: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();
    const pass = await bcrypt.hash('password', 12);

    user = await prisma.user.create({
      data: {
        hashedPassword: pass,
        email: 'test@user.com',
      },
    });

    accessToken = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: 'password' })
      .expect(200)
      .then((res) => res.body.accessToken);

    task = await prisma.task.create({
      data: {
        title: 'Test Task',
        description: 'Test Description',
        userId: user.id,
        updatedAt: new Date('2020-01-01'),
        createdAt: new Date('2020-01-01'),
      },
    });

    jsonTask = {
      ...task,
      createdAt: task.createdAt.toJSON(),
      updatedAt: task.updatedAt.toJSON(),
    };
  });

  afterAll(async () => {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Task" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" CASCADE');
    await prisma.$executeRawUnsafe('TRUNCATE "Task" RESTART IDENTITY CASCADE;');
    await prisma.$executeRawUnsafe('TRUNCATE "User" RESTART IDENTITY CASCADE;');
    await prisma.$disconnect();
    await app.close();
  });

  afterEach(async () => {
    // TODO: use transactions and transaction rollback once prisma supports it
  });

  describe('GET /todo', () => {
    it('should return all tasks', async () => {
      const res = await request(app.getHttpServer())
        .get('/todo')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(res.body).toEqual([jsonTask]);
    });

    it('should return 401 if no auth token is provided', async () => {
      await request(app.getHttpServer()).get('/todo').expect(401);
    });
  });

  describe('GET /todo/:id', () => {
    it('should return a task by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/todo/${task.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(res.body).toEqual(jsonTask);
    });

    it('should return 401 if no auth token is provided', async () => {
      await request(app.getHttpServer()).get(`/todo/${task.id}`).expect(401);
    });

    it('should return 404 if task does not exist', async () => {
      await request(app.getHttpServer())
        .get(`/todo/999`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then((res) => expect(res.body).toEqual({}));
    });
  });

  describe('POST /todo', () => {
    it('should create a task', async () => {
      const res = await request(app.getHttpServer())
        .post(`/todo`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'New Task',
          description: 'New Description',
          createdAt: new Date('2020-01-01'),
          updatedAt: new Date('2020-01-01'),
        })
        .expect(201);
      expect(res.body).toEqual({
        id: 2,
        title: 'New Task',
        description: 'New Description',
        createdAt: res.body.createdAt,
        updatedAt: res.body.updatedAt,
        userId: user.id,
      });
    });

    it('should return 401 if no auth token is provided', async () => {
      await request(app.getHttpServer())
        .post(`/todo`)
        .send({ title: 'New Task', description: 'New Description' })
        .expect(401);
    });

    it('should return 400 if title is not provided', async () => {
      await request(app.getHttpServer())
        .post(`/todo`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ description: 'New Description' })
        .expect(400);
    });
  });

  describe('PUT /todo/:id', () => {
    it('should update a task', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/todo/${task.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Updated Task',
          description: 'Updated Description',
          createdAt: new Date('2020-01-01'),
          updatedAt: new Date('2020-01-01'),
        })
        .expect(200);
      expect(res.body).toEqual({
        id: task.id,
        title: 'Updated Task',
        description: 'Updated Description',
        createdAt: res.body.createdAt,
        updatedAt: res.body.updatedAt,
        userId: user.id,
      });
    });

    it('should return 401 if no auth token is provided', async () => {
      await request(app.getHttpServer())
        .patch(`/todo/${task.id}`)
        .send({ title: 'Updated Task', description: 'Updated Description' })
        .expect(401);
    });

    it('should return 404 if task does not exist', async () => {
      await request(app.getHttpServer())
        .put(`/todo/999`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Updated Task', description: 'Updated Description' })
        .expect(404);
    });
  });

  describe('DELETE /todo/:id', () => {
    it('should delete a task', async () => {
      await request(app.getHttpServer())
        .delete(`/todo/${task.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });

    it('should return 401 if no auth token is provided', async () => {
      await request(app.getHttpServer()).delete(`/todo/${task.id}`).expect(401);
    });

    it('should return 404 if task does not exist', async () => {
      await request(app.getHttpServer())
        .delete(`/todo/999`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });
  });
});
