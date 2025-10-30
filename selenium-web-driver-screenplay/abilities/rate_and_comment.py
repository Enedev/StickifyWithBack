from screenpy import Forgettable

class RateAndComment(Forgettable):

    @staticmethod
    def granted():
        return RateAndComment()

    def forget(self):
        pass

    def __repr__(self):
        return "<Ability: RateAndComment>"
