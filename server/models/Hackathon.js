import mongoose from 'mongoose';

const hackathonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: { type: String, required: true },
  rules: { type: String },
  isOpen: { type: Boolean, default: true },
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }]
}, { timestamps: true });

export default mongoose.model('Hackathon', hackathonSchema);
