import Rating from '../models/Rating.js';
import User from '../models/User.js';

export const submitRating = async (req, res) => {
  try {
    const { rateeId, hackathonId, communication, leadership, reliability } = req.body;

    if (req.user._id.toString() === rateeId) {
      return res.status(400).json({ message: 'Cannot rate yourself' });
    }

    // Check if already rated
    const existingRating = await Rating.findOne({
      raterId: req.user._id,
      rateeId,
      hackathonId
    });

    if (existingRating) {
      return res.status(400).json({ message: 'Already rated this user for this event' });
    }

    const rating = await Rating.create({
      raterId: req.user._id,
      rateeId,
      hackathonId,
      scores: { communication, leadership, reliability }
    });

    // Update User Trust Score
    const user = await User.findById(rateeId);
    
    // Running average calculation
    const total = user.trustScore.totalRatings;
    
    user.trustScore.communication = ((user.trustScore.communication * total) + communication) / (total + 1);
    user.trustScore.leadership = ((user.trustScore.leadership * total) + leadership) / (total + 1);
    user.trustScore.reliability = ((user.trustScore.reliability * total) + reliability) / (total + 1);
    user.trustScore.totalRatings += 1;

    // Track hackathon participation (if not already tracked)
    if (!user.hackathonsParticipated.includes(hackathonId)) {
      user.hackathonsParticipated.push(hackathonId);
    }

    await user.save();

    res.status(201).json({ message: 'Rating submitted successfully', rating });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
