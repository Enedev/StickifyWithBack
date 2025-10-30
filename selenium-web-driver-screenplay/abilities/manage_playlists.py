from screenpy import Forgettable

class ManagePlaylists(Forgettable):

    @staticmethod
    def granted():
        return ManagePlaylists()

    def forget(self):
        pass

    def __repr__(self):
        return "<Ability: ManagePlaylists>"
