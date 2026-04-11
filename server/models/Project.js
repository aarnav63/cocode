import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  requiredDevs: [{
    skill: String,
    count: { type: Number, default: 1 },
    fulfilled: { type: Boolean, default: false }
  }],
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isOpen: { type: Boolean, default: true },
  isFinished: { type: Boolean, default: false },
  requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  rejected: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
