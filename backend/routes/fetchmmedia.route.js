router.get('/media/:albumId', async (req, res) => {
    try {
      const media = await Media.find({ albumId: req.params.albumId }).sort({ createdAt: -1 }); // Sort by newest first
      res.status(200).json(media);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching media' });
    }
  });
  