// In your comments controller file (e.g., comments.controller.js)
export const getComments = async (req, res) => {
  try {
    const { albumId } = req.params;
    // Fetch comments for the album from your database
    const comments = await Comment.find({ albumId });
    res.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
};