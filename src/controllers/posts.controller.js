const postsModel = require('../models/posts.model');

// GET /posts - Get all posts
const getAllPosts = (req, res) => {
    try {
        const posts = postsModel.getAllPosts();
        res.status(200).json({
            success: true,
            data: posts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении постов'
        });
    }
};

// GET /posts/:id - Get post by id
const getPostById = (req, res) => {
    try {
        const { id } = req.params;
        const post = postsModel.getPostById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Пост не найден'
            });
        }

        res.status(200).json({
            success: true,
            data: post
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка при получении поста'
        });
    }
};

// POST /posts - Create new post
const createPost = (req, res) => {
    try {
        const { title, content, userId } = req.body;

        // Validate required fields
        if (!title || !content || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Необходимо указать title, content и userId'
            });
        }

        const newPost = postsModel.createPost({
            title,
            content,
            userId,
            authorId: req.user.id
        });

        res.status(201).json({
            success: true,
            data: newPost
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка при создании поста'
        });
    }
};

// PUT /posts/:id - Update post
const updatePost = (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, userId } = req.body;

        // Validate required fields
        if (!title || !content || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Необходимо указать title, content и userId'
            });
        }

        const existingPost = postsModel.getPostById(id);
        if (!existingPost) {
            return res.status(404).json({
                success: false,
                message: 'Пост не найден'
            });
        }

        if (req.checkOwnership && existingPost.authorId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Вы можете редактировать только свои посты'
            });
        }

        const updatedPost = postsModel.updatePost(id, { title, content, userId });

        res.status(200).json({
            success: true,
            data: updatedPost
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка при обновлении поста'
        });
    }
};

// DELETE /posts/:id - Delete post
const deletePost = (req, res) => {
    try {
        const { id } = req.params;

        const existingPost = postsModel.getPostById(id);
        if (!existingPost) {
            return res.status(404).json({
                success: false,
                message: 'Пост не найден'
            });
        }

        if (req.checkOwnership && existingPost.authorId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Вы можете удалять только свои посты'
            });
        }

        const deleted = postsModel.deletePost(id);

        res.status(200).json({
            success: true,
            message: 'Пост успешно удален'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка при удалении поста'
        });
    }
};

module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost
};
