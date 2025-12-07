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

describe('Posts API Integration Tests', () => {
    let authToken;
    let userToken;
    let testPostId;

    beforeAll(async () => {
        // Login as admin
        const adminLogin = await request(app)
            .post('/auth/login')
            .send({
                email: 'admin@example.com',
                password: 'admin123'
            });
        authToken = adminLogin.body.data.token;

        // Login as regular user
        const userLogin = await request(app)
            .post('/auth/login')
            .send({
                email: 'user@example.com',
                password: 'user123'
            });
        userToken = userLogin.body.data.token;
    });

    describe('GET /posts', () => {
        it('should return all posts without auth', async () => {
            const response = await request(app).get('/posts');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('GET /posts/:id', () => {
        it('should return specific post without auth', async () => {
            const response = await request(app).get('/posts/1');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(1);
        });

        it('should return 404 for non-existent post', async () => {
            const response = await request(app).get('/posts/9999');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /posts', () => {
        it('should create post with valid token', async () => {
            const response = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Test Post',
                    content: 'Test Content',
                    userId: 1
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe('Test Post');

            testPostId = response.body.data.id;
        });

        it('should return 401 without token', async () => {
            const response = await request(app)
                .post('/posts')
                .send({
                    title: 'Test',
                    content: 'Test',
                    userId: 1
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 for missing fields', async () => {
            const response = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Test'
                    // missing content and userId
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /posts/:id', () => {
        it('should update own post', async () => {
            // Create post first
            const createResponse = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    title: 'User Post',
                    content: 'Content',
                    userId: 2
                });

            const postId = createResponse.body.data.id;

            // Update it
            const response = await request(app)
                .put(`/posts/${postId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    title: 'Updated Title',
                    content: 'Updated Content',
                    userId: 2
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe('Updated Title');
        });

        it('should return 403 when updating other user post', async () => {
            const response = await request(app)
                .put('/posts/1')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    title: 'Hacked',
                    content: 'Hacked',
                    userId: 1
                });

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });

        it('should allow admin to update any post', async () => {
            const response = await request(app)
                .put('/posts/2')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Admin Updated',
                    content: 'Admin Content',
                    userId: 1
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should return 401 without token', async () => {
            const response = await request(app)
                .put('/posts/1')
                .send({
                    title: 'Test',
                    content: 'Test',
                    userId: 1
                });

            expect(response.status).toBe(401);
        });
    });

    describe('DELETE /posts/:id', () => {
        it('should delete own post', async () => {
            // Create post first
            const createResponse = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    title: 'To Delete',
                    content: 'Content',
                    userId: 2
                });

            const postId = createResponse.body.data.id;

            // Delete it
            const response = await request(app)
                .delete(`/posts/${postId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should return 403 when deleting other user post', async () => {
            const response = await request(app)
                .delete('/posts/1')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });

        it('should allow admin to delete any post', async () => {
            // Create a post to delete
            const createResponse = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    title: 'Admin Will Delete',
                    content: 'Content',
                    userId: 2
                });

            const postId = createResponse.body.data.id;

            const response = await request(app)
                .delete(`/posts/${postId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should return 401 without token', async () => {
            const response = await request(app)
                .delete('/posts/1');

            expect(response.status).toBe(401);
        });

        it('should return 404 for non-existent post', async () => {
            const response = await request(app)
                .delete('/posts/9999')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
        });
    });
});
