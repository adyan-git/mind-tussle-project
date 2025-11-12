// backend/src/index.js
import 'dotenv/config';
import express from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import testRoutes from './routes/test.js';
import demoRouter from './routes/demo.js';
import sessionRouter from './routes/session.js';

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({ origin: CLIENT_URL, credentials: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/demo', demoRouter);
app.use('/api/sessions', sessionRouter);

// Root
app.get('/', (req, res) => res.send('Mind Tussle backend is running.'));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
