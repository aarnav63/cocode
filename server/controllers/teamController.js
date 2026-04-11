import Team from '../models/Team.js';
import Hackathon from '../models/Hackathon.js';

export const createTeam = async (req, res) => {
  try {
    const { name, hackathonId, requiredSkills } = req.body;
    
    // Create the team and add the creator as member
    const team = await Team.create({
      name,
      hackathonId,
      members: [req.user._id],
      requiredSkills
    });

    // Add team reference to hackathon
    await Hackathon.findByIdAndUpdate(hackathonId, {
      $push: { teams: team._id }
    });

    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    if (team.isFull) return res.status(400).json({ message: 'Team is full' });

    if (team.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already in team' });
    }

    team.members.push(req.user._id);
    // Hardcoded max size limit for simplicity (say, 4 members)
    if (team.members.length >= 4) {
      team.isFull = true;
    }
    await team.save();

    res.json({ message: 'Joined team successfully', team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
