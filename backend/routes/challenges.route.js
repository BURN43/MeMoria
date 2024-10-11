import express from 'express';
import Challenge from '../models/challenges.model.js';

const router = express.Router();

// POST: Create a new challenge
router.post('/', async (req, res) => {
  const { title, albumId } = req.body;

  if (!title || !albumId) {
    return res.status(400).json({ message: 'Title and albumId are required' });
  }

  try {
    const newChallenge = new Challenge({ title, albumId });
    const savedChallenge = await newChallenge.save();
    res.status(201).json(savedChallenge);
  } catch (err) {
    console.error('Error saving challenge:', err);
    res.status(500).json({ message: 'Error creating challenge' });
  }
});

// GET: Fetch all challenges
router.get('/', async (req, res) => {
  try {
    const challenges = await Challenge.find();
    res.json(challenges);
  } catch (err) {
    console.error('Error fetching challenges:', err);
    res.status(500).json({ message: 'Error fetching challenges' });
  }
});

// DELETE: Delete a specific challenge by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedChallenge = await Challenge.findByIdAndDelete(id);

    if (!deletedChallenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    res.json({ message: 'Challenge deleted successfully', id });
  } catch (err) {
    console.error('Error deleting challenge:', err);
    res.status(500).json({ message: 'Error deleting challenge' });
  }
});

export default router;