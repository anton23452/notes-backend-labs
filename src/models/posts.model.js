// In-memory storage for posts
let posts = [
    {
        id: 1,
        title: 'Первая заметка',
        content: 'Это тестовая заметка для демонстрации API',
        userId: 1,
        authorId: 1
    },
    {
        id: 2,
        title: 'Вторая заметка',
        content: 'Еще одна заметка в системе',
        userId: 1,
        authorId: 2
    }
];

let nextId = 3;

// Get all posts
const getAllPosts = () => {
    return posts;
};

// Get post by id
const getPostById = (id) => {
    return posts.find(post => post.id === parseInt(id));
};

// Create new post
const createPost = (postData) => {
    const newPost = {
        id: nextId++,
        title: postData.title,
        content: postData.content,
        userId: postData.userId,
        authorId: postData.authorId
    };
    posts.push(newPost);
    return newPost;
};

// Update post
const updatePost = (id, postData) => {
    const index = posts.findIndex(post => post.id === parseInt(id));
    if (index === -1) {
        return null;
    }

    const updatedPost = {
        id: parseInt(id),
        title: postData.title,
        content: postData.content,
        userId: postData.userId,
        authorId: posts[index].authorId
    };

    posts[index] = updatedPost;
    return updatedPost;
};

// Delete post
const deletePost = (id) => {
    const index = posts.findIndex(post => post.id === parseInt(id));
    if (index === -1) {
        return false;
    }

    posts.splice(index, 1);
    return true;
};

module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost
};
