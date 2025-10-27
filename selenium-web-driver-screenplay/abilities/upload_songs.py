from screenpy import Ability

class UploadSongs(Ability):
    """Ability to upload songs (available for Premium users only)."""

    @staticmethod
    def granted():
        """Factory method for clarity."""
        return UploadSongs()

    def __repr__(self):
        return "<Ability: UploadSongs>"
