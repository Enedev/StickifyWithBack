from screenpy import Forgettable

class FollowUsers(Forgettable):

    @staticmethod
    def granted():
        return FollowUsers()

    def forget(self):
        pass

    def __repr__(self):
        return "<Ability: FollowUsers>"
