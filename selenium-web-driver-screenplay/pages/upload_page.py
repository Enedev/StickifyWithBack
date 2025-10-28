from screenpy import See
from screenpy_selenium.actions import Click, Enter, Wait, Open
from screenpy_selenium.questions import Text
from screenpy_selenium.target import Target
from screenpy.resolutions import IsEqualTo, ContainsTheText
from selenium.webdriver.common.by import By

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
    SONG_FILE_INPUT = Target.the("song file input").located_by("#songFile")
    SUCCESS_MESSAGE = Target.the("success message").located_by(".success-message")
    ERROR_MESSAGE = Target.the("error message").located_by(".error-message")
    CANCEL_BUTTON = Target.the("cancel button").located_by("#cancelButton")
    LANGUAGE_SELECT = Target.the("language select").located_by("#languageSelect")
    YEAR_INPUT = Target.the("year input").located_by("#yearInput")
    EMPTY_FORM = Target.the("empty form").located_by("form.pristine")
    UPLOAD_FORM = Target.the("upload form").located_by(".upload-form")

    # --- ACCIONES ---
    @staticmethod
    def navigate_to_upload():
        """Navigate to the upload page."""
        return Open.browser_on("/upload")

    @staticmethod
    def enter_artist_name(name: str):
        """Enter the artist name."""
        return Enter.the_text(name).into(UploadPage.ARTIST_INPUT)

    @staticmethod
    def enter_track_name(name: str):
        """Enter the song title."""
        return Enter.the_text(name).into(UploadPage.TRACK_INPUT)

    @staticmethod
    def enter_album_name(name: str):
        """Enter the album name."""
        return Enter.the_text(name).into(UploadPage.ALBUM_INPUT)

    @staticmethod
    def enter_genre(genre: str):
        """Enter the song genre."""
        return Enter.the_text(genre).into(UploadPage.GENRE_INPUT)

    @staticmethod
    def upload_cover_image(file_path: str):
        """Upload a cover image file."""
        return Enter.the_text(file_path).into(UploadPage.COVER_FILE_INPUT)

    @staticmethod
    def select_song_file(file_path: str):
        """Select a song file to upload."""
        return Enter.the_text(file_path).into(UploadPage.SONG_FILE_INPUT)

    @staticmethod
    def click_upload_button():
        """Click the button to upload the song."""
        return Click.on(UploadPage.UPLOAD_BUTTON)

    @staticmethod
    def click_cancel_button():
        """Click the cancel button."""
        return Click.on(UploadPage.CANCEL_BUTTON)

    @staticmethod
    def select_song_language(language: str):
        """Select the song language."""
        return Click.on_the(f"option[value='{language}']").in_the(UploadPage.LANGUAGE_SELECT)

    @staticmethod
    def enter_song_year(year: str):
        """Enter the song's year."""
        return Enter.the_text(year).into(UploadPage.YEAR_INPUT)

    # --- VALIDACIONES ---
    @staticmethod
    def title_is(expected_text: str):
        """Verify that the title matches exactly."""
        return See.the(Text.of(UploadPage.TITLE), IsEqualTo(expected_text.strip()))

    @staticmethod
    def title_contains(partial_text: str):
        """Verify that the title contains a given phrase."""
        return See.the(Text.of(UploadPage.TITLE), ContainsTheText(partial_text.strip()))

    @staticmethod
    def cover_preview_is_visible():
        """Check if the preview image is visible after selecting a file."""
        return See.the(ElementIsVisible(UploadPage.PREVIEW_IMAGE), IsEqualTo(True))

    @staticmethod
    def url_is(expected_url: str):
        """Verify that the current page URL is the upload page."""
        return See.the(BrowserURL(), IsEqualTo(expected_url))

    @staticmethod
    def upload_success_message_visible():
        """Verify that the success message is visible."""
        return See.the(ElementIsVisible(UploadPage.SUCCESS_MESSAGE), IsEqualTo(True))

    @staticmethod
    def error_message_visible():
        """Verify that the error message is visible."""
        return See.the(ElementIsVisible(UploadPage.ERROR_MESSAGE), IsEqualTo(True))

    @staticmethod
    def form_is_empty():
        """Verify that the form is empty/pristine."""
        return See.the(ElementIsVisible(UploadPage.EMPTY_FORM), IsEqualTo(True))

    @staticmethod
    def upload_form_visible():
        """Verify that the upload form is visible."""
        return See.the(ElementIsVisible(UploadPage.UPLOAD_FORM), IsEqualTo(True))

    @staticmethod
    def upload_successful(song_title: str):
        """Verify that the song was uploaded successfully."""
        return See.the(SongUploadConfirmation(), ContainsTheText(song_title))
