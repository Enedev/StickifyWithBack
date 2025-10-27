from screenpy import Ability

class SearchUsers(Ability):
    """Ability to search for other users in Stickify."""

    @staticmethod
    def granted():
        """Factory method to create the ability."""
        return SearchUsers()

    def __repr__(self):
        return "<Ability: SearchUsers>"
