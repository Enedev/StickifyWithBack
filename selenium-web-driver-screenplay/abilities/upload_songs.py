from screenpy import Forgettable

class UploadSongs(Forgettable):

    @staticmethod
    def granted():
        return UploadSongs()

    def forget(self):
        pass

    def __repr__(self):
        return "<Ability: UploadSongs>"
