import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  raterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rateeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', required: true },
  scores: {
    communication: { type: Number, required: true, min: 1, max: 5 },
    leadership: { type: Number, required: true, min: 1, max: 5 },
    reliability: { type: Number, required: true, min: 1, max: 5 }
  }
}, { timestamps: true });

export default mongoose.model('Rating', ratingSchema);
