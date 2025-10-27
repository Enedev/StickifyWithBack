from screenpy.protocols import Answerable
from abilities.upload_songs import UploadSongs

class UserRole(Answerable):
    """Question to identify the user's role based on their abilities."""

    def answered_by(self, actor):
        if actor.has_ability_to(UploadSongs):
            return "Premium"
        return "Standard"

    def __str__(self):
        return "the user's role"
