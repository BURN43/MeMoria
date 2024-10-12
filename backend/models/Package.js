import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  isMainPackage: Boolean,
  features: {
    photoLimit: Number,
    videoLimit: Number,
    albumCount: Number,
    storageDuration: Number, // in Monaten
    fullAlbumDownloads: Number,
    guestLimit: Number,
    likeFunction: Boolean,
    commentFunction: Boolean,
    photoChallenges: Boolean,
    fullQualityImages: Boolean
  },
  addOns: [{
    name: String,
    price: Number,
    description: String
  }]
});

const Package = mongoose.model('Package', packageSchema);

export default Package;