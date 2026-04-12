import User from '../models/User.js';
import Project from '../models/Project.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, skills, location, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'developer',
      skills: skills || [],
      location,
      phone,
      trustScore: { communication: 0, leadership: 0, reliability: 0, totalRatings: 0 }
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean();
    
    const completedProjectsCount = await Project.countDocuments({
      $or: [{ creatorId: user._id }, { collaborators: user._id }],
      isFinished: true
    });

    res.json({ ...user, completedProjectsCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  try {
    const { access_token } = req.body;
    
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user info from Google');
    }
    
    const payload = await response.json();
    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      return res.json({
        requireOnboarding: true,
        email,
        name,
        googleId,
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error verifying Google token', error: error.message });
  }
};

export const completeGoogleProfile = async (req, res) => {
  try {
    const { email, name, googleId, phone, location, skills, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      googleId,
      role: role || 'developer',
      skills: skills || [],
      location,
      phone,
      trustScore: { communication: 0, leadership: 0, reliability: 0, totalRatings: 0 }
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
