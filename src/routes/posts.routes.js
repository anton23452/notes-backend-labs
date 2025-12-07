const express = require('express');
const router = express.Router();
const postsController = require('../controllers/posts.controller');

// GET /posts - Get all posts
router.get('/', postsController.getAllPosts);

// GET /posts/:id - Get post by id
router.get('/:id', postsController.getPostById);

// POST /posts - Create new post
router.post('/', postsController.createPost);

// PUT /posts/:id - Update post
router.put('/:id', postsController.updatePost);

// DELETE /posts/:id - Delete post
router.delete('/:id', postsController.deletePost);

module.exports = router;
