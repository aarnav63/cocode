import User from '../models/User.js';
import Project from '../models/Project.js';

export const getDevelopers = async (req, res) => {
  try {
    // Basic match: if a skill or location query is provided we filter
    const { skill, location } = req.query;
    let query = { role: 'developer' };

    if (skill) {
      query.skills = { $regex: new RegExp(`^${skill}$`, 'i') };
    }
    if (location) {
      query.location = new RegExp(location, 'i');
    }

    const developers = await User.find(query).select('-password');
    res.json(developers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUniqueSkills = async (req, res) => {
  try {
    const rawSkills = await User.distinct('skills', { role: 'developer' });
    const uniqueMap = new Map();
    rawSkills.filter(s => s).forEach(s => {
      const lower = s.trim().toLowerCase();
      if (!uniqueMap.has(lower)) {
        uniqueMap.set(lower, s.trim());
      } else {
        // Prefer Title/CamelCase over all-lowercase
        const current = uniqueMap.get(lower);
        if (s.trim() !== lower && current === lower) {
          uniqueMap.set(lower, s.trim());
        }
      }
    });
    res.json(Array.from(uniqueMap.values()).sort());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUniqueLocations = async (req, res) => {
  try {
    const query = req.query.q || req.query.query;
    if (query) {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=12&dedupe=1&q=${encodeURIComponent(query)}`;
      const response = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'CoCode-App/1.0',
          'Accept-Language': 'en'
        }
      });
      const results = await response.json();
      const locations = Array.from(new Set(
        results
          .map(r => r.display_name)
          .filter(Boolean)
      ));
      return res.json(locations);
    }

    const rawLocations = await User.distinct('location', { role: 'developer' });
    const uniqueMap = new Map();
    rawLocations.filter(l => l).forEach(l => {
      const lower = l.trim().toLowerCase();
      if (!uniqueMap.has(lower)) {
        uniqueMap.set(lower, l.trim());
      }
    });
    res.json(Array.from(uniqueMap.values()).sort());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const completedProjectsCount = await Project.countDocuments({
      $or: [{ creatorId: user._id }, { collaborators: user._id }],
      isFinished: true
    });

    res.json({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      location: user.location,
      githubUrl: user.githubUrl,
      skills: user.skills,
      trustScore: user.trustScore,
      completedProjectsCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { skills, location, phone, githubUrl } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (skills) user.skills = skills;
    if (location) user.location = location;
    if (phone) user.phone = phone;
    if (githubUrl !== undefined) user.githubUrl = githubUrl;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
