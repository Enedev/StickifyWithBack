from screenpy import Forgettable

class RateAndComment(Forgettable):
    """Ability to rate songs and post comments."""

    @staticmethod
    def granted():
        """Factory method to create the ability."""
        return RateAndComment()

    def forget(self):
        """Clean up the ability if needed."""
        pass

    def __repr__(self):
        return "<Ability: RateAndComment>"
