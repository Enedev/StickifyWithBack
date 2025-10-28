from screenpy import Forgettable

class UploadSongs(Forgettable):
    """Ability to upload songs (available for Premium users only)."""

    @staticmethod
    def granted():
        """Factory method for clarity."""
        return UploadSongs()

    def forget(self):
        """Clean up the ability if needed."""
        pass

    def __repr__(self):
        return "<Ability: UploadSongs>"
