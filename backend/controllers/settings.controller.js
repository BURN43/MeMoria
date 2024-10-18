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
    console.log('Updating settings for user:', userId);
    console.log('Request body:', req.body);

    const updatedSettings = await Settings.findOneAndUpdate(
      { userId },
      { ...req.body, theme: req.body.theme }, // Ensure theme is included
      { new: true, upsert: true, runValidators: true }
    );

    console.log('Updated settings:', updatedSettings);

    // Emit the settings_updated event
    const io = req.app.get('io');
    io.emit('settings_updated', updatedSettings);

    res.json(updatedSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', details: error.errors });
    }
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

export const deleteSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    await Settings.findOneAndDelete({ userId });

    // Emit the settings_deleted event
    const io = req.app.get('io');
    io.emit('settings_deleted', { userId });

    res.json({ message: 'Settings deleted.' });
  } catch (error) {
    console.error('Error deleting settings:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};