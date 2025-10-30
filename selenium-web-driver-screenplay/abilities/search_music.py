from screenpy import Forgettable

class SearchMusic(Forgettable):

    @staticmethod
    def granted():
        return SearchMusic()

    def forget(self):
        pass

    def __repr__(self):
        return "<Ability: SearchMusic>"
