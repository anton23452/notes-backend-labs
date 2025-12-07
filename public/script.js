const API_URL = 'http://localhost:3000/posts';

// DOM Elements
const postForm = document.getElementById('postForm');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const userIdInput = document.getElementById('userId');
const editingIdInput = document.getElementById('editingId');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const refreshBtn = document.getElementById('refreshBtn');
const postsContainer = document.getElementById('postsContainer');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// Initialize
let isEditing = false;

// Load posts on page load
document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
});

// Form Submit Handler
postForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const postData = {
        title: titleInput.value.trim(),
        content: contentInput.value.trim(),
        userId: parseInt(userIdInput.value)
    };

    if (isEditing) {
        await updatePost(editingIdInput.value, postData);
    } else {
        await createPost(postData);
    }

    resetForm();
    loadPosts();
});

// Cancel Edit
cancelBtn.addEventListener('click', () => {
    resetForm();
});

// Refresh Button
refreshBtn.addEventListener('click', () => {
    loadPosts();
    showToast('🔄 Список обновлен');
});

// Load all posts
async function loadPosts() {
    try {
        postsContainer.innerHTML = '<div class="loading">Загрузка постов...</div>';

        const response = await fetch(API_URL);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            displayPosts(result.data);
        } else {
            postsContainer.innerHTML = `
                <div class="empty-state">
                    <span>📝</span>
                    <p>Пока нет заметок. Создайте первую!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        postsContainer.innerHTML = `
            <div class="empty-state">
                <span>⚠️</span>
                <p>Ошибка загрузки постов</p>
            </div>
        `;
    }
}

// Display posts
function displayPosts(posts) {
    postsContainer.innerHTML = posts.map(post => `
        <div class="post-item">
            <div class="post-header">
                <h3 class="post-title">${escapeHtml(post.title)}</h3>
                <span class="post-id">ID: ${post.id}</span>
            </div>
            <p class="post-content">${escapeHtml(post.content)}</p>
            <div class="post-footer">
                <div class="post-user">Пользователь: <span>#${post.userId}</span></div>
                <div class="post-actions">
                    <button class="btn-edit" onclick="editPost(${post.id})">✏️ Изменить</button>
                    <button class="btn-delete" onclick="deletePost(${post.id})">🗑️ Удалить</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Create new post
async function createPost(postData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });

        const result = await response.json();

        if (result.success) {
            showToast('✅ Заметка успешно создана!');
        } else {
            showToast('⚠️ Ошибка при создании заметки');
        }
    } catch (error) {
        console.error('Error creating post:', error);
        showToast('❌ Ошибка соединения');
    }
}

// Edit post (load data to form)
async function editPost(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const result = await response.json();

        if (result.success) {
            const post = result.data;

            titleInput.value = post.title;
            contentInput.value = post.content;
            userIdInput.value = post.userId;
            editingIdInput.value = post.id;

            isEditing = true;
            formTitle.textContent = 'Редактировать заметку';
            submitBtn.innerHTML = '<span>💾</span> Сохранить изменения';
            cancelBtn.style.display = 'inline-flex';

            // Scroll to form
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Error loading post:', error);
        showToast('❌ Ошибка загрузки заметки');
    }
}

// Update post
async function updatePost(id, postData) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });

        const result = await response.json();

        if (result.success) {
            showToast('✅ Заметка успешно обновлена!');
        } else {
            showToast('⚠️ Ошибка при обновлении заметки');
        }
    } catch (error) {
        console.error('Error updating post:', error);
        showToast('❌ Ошибка соединения');
    }
}

// Delete post
async function deletePost(id) {
    if (!confirm('Вы уверены, что хотите удалить эту заметку?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showToast('✅ Заметка удалена');
            loadPosts();
        } else {
            showToast('⚠️ Ошибка при удалении заметки');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        showToast('❌ Ошибка соединения');
    }
}

// Reset form
function resetForm() {
    postForm.reset();
    editingIdInput.value = '';
    isEditing = false;
    formTitle.textContent = 'Создать новую заметку';
    submitBtn.innerHTML = '<span>➕</span> Создать заметку';
    cancelBtn.style.display = 'none';
}

// Show toast notification
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
