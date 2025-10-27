from screenpy import Ability

class SearchMusic(Ability):
    """Ability to search for songs, artists, or albums."""

    @staticmethod
    def granted():
        return SearchMusic()

    def __repr__(self):
        return "<Ability: SearchMusic>"
