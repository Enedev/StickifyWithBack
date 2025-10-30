from screenpy import Forgettable

class SearchUsers(Forgettable):

    @staticmethod
    def granted():
        return SearchUsers()

    def forget(self):
        pass

    def __repr__(self):
        return "<Ability: SearchUsers>"
