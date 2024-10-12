import { User } from '../models/user.model.js';
import Package from '../models/Package.js';

export const updateUserPackage = async (userId, packageId) => {
  try {
    const user = await User.findById(userId);
    const packageItem = await Package.findById(packageId);

    if (!user || !packageItem) {
      throw new Error('User or Package not found');
    }

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + packageItem.features.storageDuration);

    user.package = packageItem._id;
    user.packageExpiryDate = expiryDate;

    // Zurücksetzen der Nutzungszähler
    user.photoCount = 0;
    user.videoCount = 0;
    user.albumCount = 0;
    user.fullAlbumDownloadsCount = 0;
    user.guestCount = 0;

    await user.save();

    return user;
  } catch (error) {
    console.error('Error updating user package:', error);
    throw error;
  }
};