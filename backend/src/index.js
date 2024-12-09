const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();

// Seguridad básica con helmet
app.use(helmet());

// CORS configurado solo para orígenes permitidos
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://gymconnect.com', 'https://www.gymconnect.com'] 
    : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 600 // Cache preflight por 10 minutos
};
app.use(cors(corsOptions));

// Limitar tamaño de payload
app.use(express.json({ limit: '10kb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 peticiones por ventana por IP
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Ruta 404 para endpoints no encontrados
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});