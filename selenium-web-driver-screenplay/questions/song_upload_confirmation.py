# questions/song_upload_confirmation.py
from screenpy_selenium.questions import Text
from screenpy_selenium.target import Target


class SongUploadConfirmation:

    CONFIRMATION_MESSAGE = Target.the(
        "SweetAlert upload success message"
    ).located_by("#swal2-html-container")

    def answered_by(self, actor):
        return Text.of(self.CONFIRMATION_MESSAGE).answered_by(actor)
