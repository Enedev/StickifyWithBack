from screenpy import Forgettable

class SavePlaylistToProfile(Forgettable):

    @staticmethod
    def granted():
        return SavePlaylistToProfile()

    def forget(self):
        pass

    def __repr__(self):
        return "<Ability: SavePlaylistToProfile>"
