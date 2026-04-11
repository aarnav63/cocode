import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import hackathonRoutes from './routes/hackathonRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import projectRoutes from './routes/projectRoutes.js';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/projects', projectRoutes);

app.get('/', (req, res) => {
  res.send('DevCollab API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
