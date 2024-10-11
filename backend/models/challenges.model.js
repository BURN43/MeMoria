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

// Add this pre-save hook
ChallengeSchema.pre('save', function(next) {
  console.log('Saving challenge:', this);
  next();
});



export default mongoose.model('Challenge', ChallengeSchema);