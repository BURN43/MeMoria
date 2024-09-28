export const uploadProfilePicture = async (req, res) => {
    try {
      const { file } = req;
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
  
      // Update the user's profile picture in the database, assuming user is authenticated
      // Example:
      // await User.findByIdAndUpdate(req.userId, { profilePic: file.path });
  
      res.status(200).json({ message: 'Profile picture uploaded successfully', path: file.path });
    } catch (error) {
      res.status(500).json({ message: 'Error uploading profile picture', error });
    }
  };
  
  export const uploadAlbumPhoto = async (req, res) => {
    try {
      const { file } = req;
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
  
      // Save the album photo path to the database and associate it with the album
      // Example:
      // await Album.findByIdAndUpdate(albumId, { $push: { photos: file.path } });
  
      res.status(200).json({ message: 'Album photo uploaded successfully', path: file.path });
    } catch (error) {
      res.status(500).json({ message: 'Error uploading album photo', error });
    }
  };
  