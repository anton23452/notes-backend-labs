const request = require('supertest');
const express = require('express');
require('dotenv').config();

// Create test app
const app = express();
app.use(express.json());

const authRoutes = require('../../src/routes/auth.routes');
const postsRoutes = require('../../src/routes/posts.routes');

app.use('/auth', authRoutes);
app.use('/posts', postsRoutes);

describe('Auth API Integration Tests', () => {
    let authToken;
    let userId;

    describe('POST /auth/register', () => {
        it('should register a new user', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    name: 'Integration Test User',
                    email: 'integration@test.com',
                    password: 'testpass123',
                    role: 'user'
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.email).toBe('integration@test.com');
        });

        it('should return 400 for missing fields', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    name: 'Test',
                    // missing email and password
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 for duplicate email', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    name: 'Admin',
                    email: 'admin@example.com',
                    password: 'password'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /auth/login', () => {
        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'admin@example.com',
                    password: 'admin123'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data.user.email).toBe('admin@example.com');

            // Save token for later tests
            authToken = response.body.data.token;
            userId = response.body.data.user.id;
        });

        it('should return 401 for invalid credentials', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'admin@example.com',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 for missing fields', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'admin@example.com'
                    // missing password
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /auth/me', () => {
        beforeAll(async () => {
            // Login to get token
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    email: 'admin@example.com',
                    password: 'admin123'
                });
            authToken = loginResponse.body.data.token;
        });

        it('should return user info with valid token', async () => {
            const response = await request(app)
                .get('/auth/me')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.email).toBe('admin@example.com');
        });

        it('should return 401 without token', async () => {
            const response = await request(app)
                .get('/auth/me');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should return 401 with invalid token', async () => {
            const response = await request(app)
                .get('/auth/me')
                .set('Authorization', 'Bearer invalid_token');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
});
