const postsModel = require('../../src/models/posts.model');

describe('Posts Model', () => {
    let initialPostsCount;

    beforeEach(() => {
        // Store initial state
        initialPostsCount = postsModel.getAllPosts().length;
    });

    describe('getAllPosts', () => {
        it('should return array of posts', () => {
            const posts = postsModel.getAllPosts();

            expect(Array.isArray(posts)).toBe(true);
            expect(posts.length).toBeGreaterThan(0);
        });

        it('should return posts with correct properties', () => {
            const posts = postsModel.getAllPosts();
            const post = posts[0];

            expect(post).toHaveProperty('id');
            expect(post).toHaveProperty('title');
            expect(post).toHaveProperty('content');
            expect(post).toHaveProperty('userId');
            expect(post).toHaveProperty('authorId');
        });
    });

    describe('getPostById', () => {
        it('should return post when id exists', () => {
            const post = postsModel.getPostById(1);

            expect(post).toBeDefined();
            expect(post.id).toBe(1);
        });

        it('should return undefined when id does not exist', () => {
            const post = postsModel.getPostById(9999);

            expect(post).toBeUndefined();
        });
    });

    describe('createPost', () => {
        it('should create a new post with all fields', () => {
            const newPostData = {
                title: 'Test Post',
                content: 'Test Content',
                userId: 1,
                authorId: 1
            };

            const newPost = postsModel.createPost(newPostData);

            expect(newPost).toHaveProperty('id');
            expect(newPost.title).toBe('Test Post');
            expect(newPost.content).toBe('Test Content');
            expect(newPost.userId).toBe(1);
            expect(newPost.authorId).toBe(1);
        });

        it('should increment post count after creation', () => {
            const postsBefore = postsModel.getAllPosts().length;

            postsModel.createPost({
                title: 'New',
                content: 'Content',
                userId: 1,
                authorId: 1
            });

            const postsAfter = postsModel.getAllPosts().length;
            expect(postsAfter).toBe(postsBefore + 1);
        });
    });

    describe('updatePost', () => {
        it('should update existing post', () => {
            const updatedData = {
                title: 'Updated Title',
                content: 'Updated Content',
                userId: 1
            };

            const updated = postsModel.updatePost(1, updatedData);

            expect(updated).toBeDefined();
            expect(updated.title).toBe('Updated Title');
            expect(updated.content).toBe('Updated Content');
            expect(updated.id).toBe(1);
        });

        it('should return null for non-existent post', () => {
            const updated = postsModel.updatePost(9999, {
                title: 'Test',
                content: 'Test',
                userId: 1
            });

            expect(updated).toBeNull();
        });

        it('should preserve authorId when updating', () => {
            const originalPost = postsModel.getPostById(1);
            const originalAuthorId = originalPost.authorId;

            const updated = postsModel.updatePost(1, {
                title: 'New Title',
                content: 'New Content',
                userId: 1
            });

            expect(updated.authorId).toBe(originalAuthorId);
        });
    });

    describe('deletePost', () => {
        it('should delete existing post', () => {
            const result = postsModel.deletePost(1);

            expect(result).toBe(true);
        });

        it('should return false for non-existent post', () => {
            const result = postsModel.deletePost(9999);

            expect(result).toBe(false);
        });

        it('should decrease post count after deletion', () => {
            const postsBefore = postsModel.getAllPosts().length;
            postsModel.deletePost(1);
            const postsAfter = postsModel.getAllPosts().length;

            expect(postsAfter).toBe(postsBefore - 1);
        });
    });
});
