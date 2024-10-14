import express from 'express';
import Package from '../models/package.model.js';

const router = express.Router();

// Route zum Kauf eines Add-ons
router.post('/packages/:packageId/addons/:addOnId/buy', async (req, res) => {
  const { packageId, addOnId } = req.params;

  try {
    // Finde das Paket
    const userPackage = await Package.findById(packageId);
    if (!userPackage) {
      return res.status(404).send('Package not found');
    }

    // Finde das entsprechende Add-on im Paket
    const addOn = userPackage.addOns.id(addOnId);
    if (!addOn) {
      return res.status(404).send('Add-on not found');
    }

    // Setze das Add-on auf "ausgewählt" (nach erfolgreichem Kauf)
    addOn.isSelected = true;
    await userPackage.save();

    res.json({ message: 'Add-on purchased successfully', package: userPackage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
