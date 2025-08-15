const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const courtRoutes = require('./routes/courtRoutes.js');
const reservationRoutes = require('./routes/reservationRoutes.js');
const errorHandler = require('./middlewares/errorHandler.js');

const app = express();

// Middlewares base
app.use(helmet());
app.use(morgan('dev'));

// CORS: permitir sólo el frontend
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Rutas
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/courts', courtRoutes);
app.use('/api/reservations', reservationRoutes);

// 404
app.use((req, res) => res.status(404).json({ message: 'Not Found' }));

// Manejo de errores
app.use(errorHandler);

module.exports = app;