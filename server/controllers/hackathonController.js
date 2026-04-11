import Hackathon from '../models/Hackathon.js';
import User from '../models/User.js';

export const createHackathon = async (req, res) => {
  try {
    const { title, description, date, rules } = req.body;

    if (req.user.role !== 'organizer') {
      return res.status(403).json({ message: 'Only organizers can create hackathons' });
    }

    const hackathon = await Hackathon.create({
      title,
      description,
      date,
      rules,
      organizerId: req.user._id,
    });

    res.status(201).json(hackathon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHackathons = async (req, res) => {
  try {
    const hackathons = await Hackathon.find().populate('organizerId', 'name email');
    res.json(hackathons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHackathonById = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id)
      .populate('organizerId', 'name')
      .populate('participants', 'name skills')
      .populate('teams');
    
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });
    
    res.json(hackathon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Join Hackathon (as individual before teams)
export const joinHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });

    if (hackathon.participants.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already participating' });
    }

    hackathon.participants.push(req.user._id);
    await hackathon.save();

    res.json({ message: 'Joined successfully', hackathon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
