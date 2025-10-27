from screenpy import Ability

class SavePlaylistToProfile(Ability):
    """Ability to save a playlist to the user's personal profile."""

    @staticmethod
    def granted():
        """Factory method to create the ability."""
        return SavePlaylistToProfile()

    def __repr__(self):
        return "<Ability: SavePlaylistToProfile>"
