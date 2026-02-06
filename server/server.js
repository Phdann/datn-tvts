const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const db = require('./models'); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', require('./routes/publicRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to admission server' });
});

if (process.env.NODE_ENV !== 'test') {
    
    
    const shouldSync = process.env.SYNC_DB === 'true';
    
    if (shouldSync) {
        console.log('Database sync enabled...');
        db.sequelize.sync({ alter: true }).then(() => {
            console.log("Database Synced Successfully!");
            startServer();
        }).catch((err) => {
            console.error("Failed to sync database:", err.message);
        });
    } else {
        console.log('ℹDatabase sync disabled (use SYNC_DB=true to enable)');
        startServer();
    }
}

function startServer() {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;