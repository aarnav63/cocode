import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  requiredSkills: [{ type: String }],
  isFull: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Team', teamSchema);
