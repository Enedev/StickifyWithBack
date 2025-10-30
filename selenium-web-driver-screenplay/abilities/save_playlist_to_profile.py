from screenpy import Forgettable

class SavePlaylistToProfile(Forgettable):
    """Ability to save a playlist to the user's personal profile."""

    @staticmethod
    def granted():
        """Factory method to create the ability."""
        return SavePlaylistToProfile()

    def forget(self):
        """Clean up the ability if needed."""
        pass

    def __repr__(self):
        return "<Ability: SavePlaylistToProfile>"
