const express = require('express');
const path = require('path');
const postsRoutes = require('./routes/posts.routes');

const app = express();
const PORT = 3000;

// Middleware для парсинга JSON
app.use(express.json());

// Раздача статических файлов (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../public')));

// API info route
app.get('/api', (req, res) => {
    res.json({
        message: 'Notes Backend API',
        version: '1.0.0',
        endpoints: {
            posts: '/posts',
            web_interface: '/'
        }
    });
});

// Подключение роутов для постов
app.use('/posts', postsRoutes);

// Обработка несуществующих маршрутов
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Маршрут не найден'
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📝 API доступно по адресу: http://localhost:${PORT}`);
});
