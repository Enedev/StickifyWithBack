from screenpy import Ability

class ManagePlaylists(Ability):
    """Ability to create, edit, and delete playlists."""

    @staticmethod
    def granted():
        """Factory method to make syntax more readable."""
        return ManagePlaylists()

    def __repr__(self):
        return "<Ability: ManagePlaylists>"
