import User from '../models/User.js';

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

    res.json({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      location: user.location,
      skills: user.skills,
      trustScore: user.trustScore,
      hackathonsParticipated: user.hackathonsParticipated.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { skills, location, phone } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (skills) user.skills = skills;
    if (location) user.location = location;
    if (phone) user.phone = phone;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
