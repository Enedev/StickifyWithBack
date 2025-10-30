# pages/upload_page.py
from screenpy import See
from screenpy_selenium.actions import Click, Enter, Wait, Open
from screenpy_selenium.questions import Text
from screenpy_selenium.target import Target
from screenpy.resolutions import IsEqualTo, ContainsTheText

from questions.browser_url import BrowserURL
from questions.element_is_visible import ElementIsVisible
from questions.song_upload_confirmation import SongUploadConfirmation


class UploadPage:
    """Page Object representing the 'Upload Song' page in Stickify."""

    # --- ELEMENTOS (Targets) ---
    TITLE = Target.the("upload title").located_by(".upload-form h2")
    ARTIST_INPUT = Target.the("artist name input").located_by("#artistName")
    TRACK_INPUT = Target.the("track name input").located_by("#trackName")
    ALBUM_INPUT = Target.the("album name input").located_by("#collectionName")
    GENRE_INPUT = Target.the("genre input").located_by("#primaryGenreName")
    COVER_FILE_INPUT = Target.the("cover image file input").located_by("#artworkFile")
    COVER_LABEL = Target.the("cover upload label").located_by(".file-upload-label")
    PREVIEW_IMAGE = Target.the("image preview").located_by(".image-preview")
    UPLOAD_BUTTON = Target.the("upload song button").located_by("#uploadButton")
    UPLOAD_FORM = Target.the("upload form").located_by("div.upload-form")
    SWEET_ALERT = Target.the("sweet alert").located_by(".swal2-popup")
    SWEET_ALERT_OK_BUTTON = Target.the("sweet alert OK button").located_by(".swal2-confirm")
    LOADER_ALERT = Target.the("loader alert during upload").located_by(".swal2-popup.swal2-loading")

    # --- ACCIONES ---
    @staticmethod
    def navigate_to_upload():
        """Navigate to the upload page (full path from tests)."""
        return Open.browser_on("http://localhost:4200/upload")

    @staticmethod
    def enter_artist_name(name: str):
        return Enter.the_text(name).into(UploadPage.ARTIST_INPUT)

    @staticmethod
    def enter_track_name(name: str):
        return Enter.the_text(name).into(UploadPage.TRACK_INPUT)

    @staticmethod
    def enter_album_name(name: str):
        return Enter.the_text(name).into(UploadPage.ALBUM_INPUT)

    @staticmethod
    def enter_genre(genre: str):
        return Enter.the_text(genre).into(UploadPage.GENRE_INPUT)

    @staticmethod
    def upload_cover_image(file_path: str):
        """
        Upload a cover image file.
        Note: Selenium file inputs usually expect a filesystem path used with send_keys.
        """
        return Enter.the_text(file_path).into(UploadPage.COVER_FILE_INPUT)

    @staticmethod
    def click_upload_button():
        return Click.on(UploadPage.UPLOAD_BUTTON)

    # --- VALIDACIONES ---
    @staticmethod
    def title_contains(partial_text: str):
        return See.the(Text.of(UploadPage.TITLE), ContainsTheText(partial_text.strip()))

    @staticmethod
    def cover_preview_is_visible():
        return See.the(ElementIsVisible(UploadPage.PREVIEW_IMAGE), IsEqualTo(True))

    @staticmethod
    def upload_form_visible():
        return See.the(ElementIsVisible(UploadPage.UPLOAD_FORM), IsEqualTo(True))

    @staticmethod
    def url_is(expected_url: str):
        return See.the(BrowserURL(), IsEqualTo(expected_url))

    @staticmethod
    def upload_successful(song_title: str):
        """Verify that the song was uploaded successfully (using app confirmation)."""
        return See.the(SongUploadConfirmation(), ContainsTheText(song_title))
