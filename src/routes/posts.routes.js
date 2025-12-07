const express = require('express');
const router = express.Router();
const postsController = require('../controllers/posts.controller');
const { verifyToken, checkRole, isOwnerOrAdmin } = require('../middleware/auth.middleware');

// GET /posts - Get all posts (public, no auth required)
router.get('/', postsController.getAllPosts);

// GET /posts/:id - Get post by id (public, no auth required)
router.get('/:id', postsController.getPostById);

// POST /posts - Create new post (requires user or admin role)
router.post('/', verifyToken, checkRole('user', 'admin'), postsController.createPost);

// PUT /posts/:id - Update post (requires ownership or admin)
router.put('/:id', verifyToken, isOwnerOrAdmin, postsController.updatePost);

// DELETE /posts/:id - Delete post (requires ownership or admin)
router.delete('/:id', verifyToken, isOwnerOrAdmin, postsController.deletePost);

module.exports = router;
