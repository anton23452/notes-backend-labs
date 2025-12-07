const express = require('express');
const router = express.Router();
const postsController = require('../controllers/posts.controller');
const { verifyToken, checkRole, isOwnerOrAdmin } = require('../middleware/auth.middleware');
const { cache, clearCache } = require('../middleware/cache.middleware');

// Helper middleware to clear cache after mutations
const clearPostCache = async (req, res, next) => {
    res.on('finish', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            clearCache(); // Invalidate cache on success
        }
    });
    next();
};

// GET /posts - Public access with Redis Cache
router.get('/', cache, postsController.getAllPosts);

// GET /posts/:id - Get post by id (public, no auth required)
router.get('/:id', postsController.getPostById);

// POST /posts - Protected (user, admin) + Clear Cache
router.post('/', verifyToken, checkRole('user', 'admin'), clearPostCache, postsController.createPost);

// PUT /posts/:id - Protected (owner, admin) + Clear Cache
router.put('/:id', verifyToken, isOwnerOrAdmin, clearPostCache, postsController.updatePost);

// DELETE /posts/:id - Protected (owner, admin) + Clear Cache
router.delete('/:id', verifyToken, isOwnerOrAdmin, clearPostCache, postsController.deletePost);

module.exports = router;
