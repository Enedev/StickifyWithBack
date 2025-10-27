from screenpy import See
from screenpy_selenium.actions import Click, Enter
from screenpy_selenium.questions import Text
from screenpy_selenium.target import Target
from screenpy.resolutions import IsEqualTo, ContainsTheText
from selenium.webdriver.common.by import By

from questions.browser_url import BrowserURL


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

    # --- ACCIONES ---
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
    def click_upload_button():
        """Click the button to upload the song."""
        return Click.on(UploadPage.UPLOAD_BUTTON)

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
        return See.the(Text.of(UploadPage.PREVIEW_IMAGE), ContainsTheText(""))

    @staticmethod
    def url_is(expected_url: str):
        """Verify that the current page URL is the upload page."""
        return See.the(BrowserURL(), IsEqualTo(expected_url))
