export interface UserSavedPlaylist {
  id: string; // The ID of the UserSavedPlaylist entry itself
  user_id: string; // The ID (email or UUID) of the user who saved it
  playlist_id: string; // The ID of the playlist that was saved
  saved_at?: Date | string; // Timestamp when it was saved (optional, backend can set default)
  // No need for 'playlist' or 'user' objects here for the DTO
}