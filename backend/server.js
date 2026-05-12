import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import consultationRoutes from './routes/consultationRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/doctors', doctorRoutes);

// Socket.IO Logic
const onlineDoctors = new Map(); // doctorId -> socketId
app.set('io', io);
app.set('onlineDoctors', onlineDoctors);

io.on('connection', (socket) => {
  const { userId, role } = socket.handshake.query;
  console.log('A user connected:', socket.id, 'Role:', role);

  if (role === 'Doctor' && userId) {
    onlineDoctors.set(userId, socket.id);
  }

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (role === 'Doctor' && userId) {
      onlineDoctors.delete(userId);
    }
  });
});

const PORT = process.env.PORT || 5007;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
