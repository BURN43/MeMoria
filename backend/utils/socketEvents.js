const socketEvents = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected');

    // Benutzer- und Authentifizierungs-Events
    socket.on('user_logged_in', (userData) => io.emit('user_logged_in', userData));
    socket.on('user_logged_out', (userId) => io.emit('user_logged_out', userId));
    socket.on('user_registered', (userData) => io.emit('user_registered', userData));
    socket.on('user_typing_comment', (commentData) => io.emit('user_typing_comment', commentData));

    // Album- und Medien-Events
    socket.on('album_created', (albumData) => io.emit('album_created', albumData));
    socket.on('album_updated', (albumData) => io.emit('album_updated', albumData));
    socket.on('album_deleted', (albumId) => io.emit('album_deleted', albumId));
    socket.on('media_uploaded', (mediaData) => io.emit('media_uploaded', mediaData));
    socket.on('media_updated', (mediaData) => io.emit('media_updated', mediaData));
    socket.on('media_deleted', (mediaId) => io.emit('media_deleted', mediaId));

    // Kommentar-Events
    socket.on('comment_added', (commentData) => io.emit('comment_added', commentData));
    socket.on('comment_edited', (commentData) => io.emit('comment_edited', commentData));
    socket.on('comment_deleted', (commentId) => io.emit('comment_deleted', commentId));

    // Like- und Interaktions-Events
    socket.on('media_liked', (likeData) => io.emit('media_liked', likeData));
    socket.on('media_unliked', (likeData) => io.emit('media_unliked', likeData));
    socket.on('comment_liked', (likeData) => io.emit('comment_liked', likeData));

    // Challenge-Events
    socket.on('challenge_created', (challengeData) => io.emit('challenge_created', challengeData));
    socket.on('challenge_updated', (challengeData) => io.emit('challenge_updated', challengeData));
    socket.on('challenge_completed', (completionData) => io.emit('challenge_completed', completionData));
    socket.on('challenge_ended', (challengeId) => io.emit('challenge_ended', challengeId));

    // Galerie- und Ansicht-Events
    socket.on('gallery_refreshed', () => io.emit('gallery_refreshed'));
    socket.on('media_viewed', (mediaId) => io.emit('media_viewed', mediaId));
    socket.on('profile_picture_updated', (userData) => io.emit('profile_picture_updated', userData));

    // Settings-Events (Neu hinzugefügt)
    socket.on('settings_updated', (settingsData) => io.emit('settings_updated', settingsData));
    socket.on('settings_deleted', () => io.emit('settings_deleted'));

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};

export default socketEvents;