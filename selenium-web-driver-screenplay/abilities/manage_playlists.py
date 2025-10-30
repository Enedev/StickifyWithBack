from screenpy import Forgettable

class ManagePlaylists(Forgettable):
    """Ability to create, edit, and delete playlists."""

    @staticmethod
    def granted():
        """Factory method to make syntax more readable."""
        return ManagePlaylists()

    def forget(self):
        """Clean up the ability if needed."""
        pass

    def __repr__(self):
        return "<Ability: ManagePlaylists>"
