require('dotenv').config();
const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const postsRoutes = require('./routes/posts.routes');
const authRoutes = require('./routes/auth.routes');
const rateLimit = require('./middleware/rateLimit.middleware');
const { cache } = require('./middleware/cache.middleware');

// Load Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для парсинга JSON
app.use(express.json());

// Раздача статических файлов (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../public')));

// Rate Limiting (DDOS protection)
app.use(rateLimit);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API info route
app.get('/api', (req, res) => {
    res.json({
        message: 'Notes Backend API',
        version: '1.0.0',
        endpoints: {
            auth: '/auth',
            posts: '/posts',
            web_interface: '/',
            api_documentation: '/api-docs'
        }
    });
});

// Подключение роутов для постов
// Заметим, что кеширование реализовано внутри роутера для GET запросов
app.use('/posts', postsRoutes);

// Подключение роутов для аутентификации
app.use('/auth', authRoutes);

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
