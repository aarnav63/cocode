import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for Google users
  googleId: { type: String },
  role: { type: String, enum: ['developer', 'organizer'], default: 'developer' },
  skills: [{ 
    type: String, 
    set: (val) => val ? val.trim().toLowerCase().replace(/\b\w/g, char => char.toUpperCase()) : val 
  }],
  location: { type: String },
  phone: { type: String },
  trustScore: {
    communication: { type: Number, default: 0 },
    leadership: { type: Number, default: 0 },
    reliability: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 }
  },
  hackathonsParticipated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon' }]
}, { timestamps: true });

export default mongoose.model('User', userSchema);
