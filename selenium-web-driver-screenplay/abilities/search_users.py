from screenpy import Forgettable

class SearchUsers(Forgettable):
    """Ability to search for other users in Stickify."""

    @staticmethod
    def granted():
        """Factory method to create the ability."""
        return SearchUsers()

    def forget(self):
        """Clean up the ability if needed."""
        pass

    def __repr__(self):
        return "<Ability: SearchUsers>"
