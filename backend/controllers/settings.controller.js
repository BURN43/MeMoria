import Settings from '../models/settings.model.js';

// Get settings for a specific user
export const getSettings = async (req, res) => {
  try {
    const { userId } = req.params; // Use userId from req.params
    const settings = await Settings.findOne({ userId });
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update settings for a specific user
export const updateSettings = async (req, res) => {
  try {
    const { userId } = req.params; // Use userId from req.params
    console.log('Updating settings for userId:', userId, 'with data:', req.body);

    const updatedSettings = await Settings.findOneAndUpdate(
      { userId },
      req.body,
      { new: true, upsert: true } // 'upsert: true' creates the document if it doesn't exist
    );

    console.log('Updated settings document:', updatedSettings);
    res.status(200).json(updatedSettings);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete settings for a specific user
export const deleteSettings = async (req, res) => {
  try {
    const { userId } = req.params;
    await Settings.findOneAndDelete({ userId });
    res.status(200).json({ message: 'Settings deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
