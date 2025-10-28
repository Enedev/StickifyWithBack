from screenpy import Forgettable

class SearchMusic(Forgettable):
    """Ability to search for songs, artists, or albums."""

    @staticmethod
    def granted():
        return SearchMusic()

    def forget(self):
        """Clean up the ability if needed."""
        pass

    def __repr__(self):
        return "<Ability: SearchMusic>"
