// controllers/settings.controller.js
import Settings from '../models/settings.model.js';

export const getSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const settings = await Settings.findOne({ userId });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found.' });
    }
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const updatedSettings = await Settings.findOneAndUpdate(
      { userId },
      req.body,
      { new: true, upsert: true } // Upsert to create if not exists
    );
    res.json(updatedSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

export const deleteSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    await Settings.findOneAndDelete({ userId });
    res.json({ message: 'Settings deleted.' });
  } catch (error) {
    console.error('Error deleting settings:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
