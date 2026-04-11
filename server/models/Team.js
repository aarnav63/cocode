import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  requiredDevs: [{
    skill: { 
      type: String, 
      set: (val) => val ? val.trim().toLowerCase().replace(/\b\w/g, char => char.toUpperCase()) : val 
    },
    count: { type: Number, default: 1 },
    fulfilled: { type: Boolean, default: false }
  }],
  requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rejected: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isFull: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Team', teamSchema);
