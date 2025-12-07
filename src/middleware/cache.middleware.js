const redis = require('redis');

let redisClient;

(async () => {
    redisClient = redis.createClient();

    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    redisClient.on('connect', () => console.log('Redis Connected!'));

    // Gracefully handle connection failures in development without crashing
    try {
        await redisClient.connect();
    } catch (e) {
        console.log('Redis connection failed - ensure Redis server is running if you want caching');
    }
})();

// Cache middleware
const cache = async (req, res, next) => {
    if (!redisClient || !redisClient.isOpen) {
        return next();
    }

    const key = `notes_cache_${req.originalUrl || req.url}`;

    try {
        const cachedData = await redisClient.get(key);

        if (cachedData) {
            console.log('Using cached data for:', key);
            return res.status(200).json(JSON.parse(cachedData));
        }

        // Wrap res.json to cache the response before sending
        const originalJson = res.json;
        res.json = (body) => {
            // Only cache successful GET requests
            if (res.statusCode === 200) {
                redisClient.setEx(key, 3600, JSON.stringify(body)); // Cache for 1 hour
            }
            return originalJson.call(res, body);
        };

        next();
    } catch (err) {
        console.error('Redis cache error:', err);
        next();
    }
};

// Helper to clear cache (use this in mutations like POST/PUT/DELETE)
const clearCache = async (pattern = 'notes_cache_*') => {
    if (!redisClient || !redisClient.isOpen) return;

    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    } catch (err) {
        console.error('Error clearing cache:', err);
    }
};

module.exports = {
    cache,
    clearCache
};
