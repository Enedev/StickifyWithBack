from screenpy import Forgettable

class FollowUsers(Forgettable):
    """Ability to follow or unfollow other users."""

    @staticmethod
    def granted():
        return FollowUsers()

    def forget(self):
        """Clean up the ability if needed."""
        pass

    def __repr__(self):
        return "<Ability: FollowUsers>"
