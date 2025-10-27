from screenpy import Ability

class RateAndComment(Ability):
    """Ability to rate songs and post comments."""

    @staticmethod
    def granted():
        """Factory method to create the ability."""
        return RateAndComment()

    def __repr__(self):
        return "<Ability: RateAndComment>"
