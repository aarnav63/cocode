import User from '../models/User.js';
import Project from '../models/Project.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const parseCookies = (cookieHeader = '') => {
  return cookieHeader.split(';').reduce((cookies, cookie) => {
    const [name, ...rest] = cookie.trim().split('=');
    if (!name) return cookies;
    cookies[name] = rest.join('=');
    return cookies;
  }, {});
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const sendRefreshToken = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth'
  });
};

const clearRefreshToken = (res) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    expires: new Date(0),
    path: '/api/auth'
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
      const accessToken = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
      sendRefreshToken(res, refreshToken);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: accessToken,
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
      const accessToken = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
      sendRefreshToken(res, refreshToken);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: accessToken,
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
      const accessToken = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
      sendRefreshToken(res, refreshToken);
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: accessToken,
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

    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    sendRefreshToken(res, refreshToken);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const cookies = parseCookies(req.headers.cookie || '');
    const refreshToken = cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token missing' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const accessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    sendRefreshToken(res, newRefreshToken);

    res.json({ token: accessToken });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Refresh token invalid or expired' });
  }
};

export const logout = (req, res) => {
  clearRefreshToken(res);
  res.json({ message: 'Logged out successfully' });
};
