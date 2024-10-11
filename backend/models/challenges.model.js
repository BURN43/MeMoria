import mongoose from 'mongoose';

const ChallengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
  albumId: {
    type: String, // Assuming you have an album collection
    ref: 'Album',
    required: true, // Make it required if every challenge should be tied to an album
  },
});

export default mongoose.model('Challenge', ChallengeSchema);