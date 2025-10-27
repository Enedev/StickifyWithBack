from screenpy import Ability

class FollowUsers(Ability):
    """Ability to follow or unfollow other users."""

    @staticmethod
    def granted():
        return FollowUsers()

    def __repr__(self):
        return "<Ability: FollowUsers>"
