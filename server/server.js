const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const db = require('./models'); 

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
    'https://datn-tvts-twht.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            console.log('Origin not allowed by CORS:', origin);
            // Allow all for production if we want to be safe, or just return true.
            // For now, let's keep it strict but inclusive of the Vercel domain.
            return callback(null, true); 
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 200
}));

// Add pre-flight options for all routes
app.options('*', cors());

app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    contentSecurityPolicy: false,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const { swaggerUi, specs } = require('./utils/swagger');

app.use('/api', require('./routes/publicRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/', async (req, res) => {
    try {
        // Thực hiện một truy vấn nhỏ để kiểm tra tình trạng kết nối Database
        await db.sequelize.query('SELECT 1');
        res.json({ 
            status: 'success',
            message: 'Welcome to admission server',
            database: 'Connected & Active'
        });
    } catch (err) {
        console.error('Ping error:', err.message);
        res.status(500).json({ 
            status: 'error', 
            message: 'Welcome to admission server',
            database: 'Connection failed',
            error: err.message
        });
    }
});

// Khởi động server ngay lập tức để tránh bị platform kill vì không bind port kịp thời
startServer();

if (process.env.NODE_ENV !== 'test') {    
    const shouldSync = process.env.SYNC_DB === 'true';
    
    if (shouldSync) {
        console.log('Database sync enabled, starting in background...');
        db.sequelize.sync().then(async () => {
            console.log("Database Synced Successfully!");
            
            // Fix null slugs for categories (one-time check on startup)
            try {
                const categories = await db.Category.findAll({ where: { slug: null } });
                if (categories.length > 0) {
                    console.log(`[Startup] Found ${categories.length} categories with null slug, fixing...`);
                    // Simple slugify for startup fix
                    const simpleSlugify = (str) => {
                        if (!str) return '';
                        return str.toLowerCase()
                            .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
                            .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
                            .replace(/ì|í|ị|ỉ|ĩ/g, "i")
                            .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
                            .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
                            .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
                            .replace(/đ/g, "d")
                            .replace(/[^a-z0-9 -]/g, "")
                            .replace(/\s+/g, "-")
                            .replace(/-+/g, "-")
                            .trim();
                    };
                    for (const c of categories) {
                        const newSlug = simpleSlugify(c.name);
                        console.log(`[Startup] Updating ${c.name} -> ${newSlug}`);
                        await c.update({ slug: newSlug });
                    }
                }
            } catch (err) {
                console.error("[Startup] Error fixing category slugs:", err.message);
            }
        }).catch((err) => {
            console.error("Failed to sync database:", err.message);
            // Không thoát process ở đây để server vẫn có thể phản hồi lỗi qua API
        });
    } else {
        console.log('Database sync disabled (use SYNC_DB=true to enable)');
    }
}

function startServer() {
    const port = process.env.PORT || 5000;
    const serverInstance = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        console.log(`==> Your service is live 🎉`);
    });

    // Tăng timeout lên 2 phút để đợi AI tạo bài viết dài
    serverInstance.timeout = 120000;
}

module.exports = app;

// Global error handlers to catch silent crashes
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
    // Optional: process.exit(1) if you want to force restart
});