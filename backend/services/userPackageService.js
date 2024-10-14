import { User } from '../models/user.model.js';
import Package from '../models/Package.js';

export const updateUserPackage = async (userId, packageId) => {
  try {
    const user = await User.findById(userId);
    const packageItem = await Package.findById(packageId);

    // Überprüfung, ob der Benutzer oder das Paket existiert
    if (!user || !packageItem) {
      throw new Error('User or Package not found');
    }

    // Ablaufdatum festlegen basierend auf der Speicherdauer des Pakets
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + packageItem.features.storageDuration);

    // Aktualisiere die Benutzerinformationen
    user.package = packageItem._id;
    user.packageExpiryDate = expiryDate;

    // Zähler zurücksetzen
    user.photoCount = 0;
    user.videoCount = 0;
    user.albumCount = 0;
    user.fullAlbumDownloadsCount = 0;
    user.guestCount = 0;

    // Speichere die aktualisierten Benutzerdaten
    await user.save();

    return user; // Gibt den aktualisierten Benutzer zurück
  } catch (error) {
    console.error('Error updating user package:', error);
    throw error; // Wirf den Fehler weiter, um ihn im Webhook-Handler richtig handhaben zu können
  }
};