from screenpy import See
from screenpy_selenium.actions import Click, Enter, Wait, Open
from screenpy_selenium.questions import Text
from screenpy_selenium.target import Target
from screenpy.resolutions import IsEqualTo, ContainsTheText
from selenium.webdriver.common.by import By

from questions.browser_url import BrowserURL
from questions.element_is_visible import ElementIsVisible
from questions.playlist_count import PlaylistCount
from actions.scroll_to_element import ScrollToElement

class PlaylistsPage:
    """Page Object representing the Stickify Playlists Page."""

    # --- ELEMENTOS (Targets) ---
    CREATE_PLAYLIST_BUTTON = Target.the("create playlist button").located_by(".create-playlist-button")
    MODAL = Target.the("playlist creation modal").located_by(".modal")
    CLOSE_MODAL_BUTTON = Target.the("close modal button").located_by(".modal .close")
    PLAYLIST_NAME_INPUT = Target.the("playlist name input").located_by(".playlist-name-input")
    SONG_CARD = Target.the("song card in modal").located_by(".songs-grid .song-card")
    SAVE_PLAYLIST_BUTTON = Target.the("save playlist button").located_by(".save-playlist")
    SUCCESS_MESSAGE = Target.the("success message").located_by(".success-message")

    # User Playlists Section
    USER_PLAYLIST_TITLE = Target.the("user playlists section title").located_by("h1.playlist-title:nth-of-type(1)")
    USER_PLAYLIST_CARD = Target.the("second user playlist card").located_by(
        ".playlist-grid:nth-of-type(1) .playlist-card:nth-of-type(2)"
    )
    SAVE_TO_PROFILE_BUTTON = Target.the("save second playlist to profile button").located_by(
        ".playlist-grid:nth-of-type(1) .playlist-card:nth-of-type(2) .save-playlist-profile"
    )
    DELETE_PLAYLIST_BUTTON = Target.the("delete playlist button").located_by(".delete-playlist")
    CONFIRM_DELETE_BUTTON = Target.the("confirm delete button").located_by(".confirm-delete")
    PLAYLIST_NAME = Target.the("second playlist name inside playlist card").located_by(
    ".playlist-grid:nth-of-type(1) .playlist-card:nth-of-type(2) h3"
)

    
    # Automatic Playlists Section
    AUTO_PLAYLIST_TITLE = Target.the("automatic playlists section title").located_by("h1.playlist-title:nth-of-type(2)")
    AUTO_PLAYLIST_CARD = Target.the("automatic playlist card").located_by(".playlist-grid:nth-of-type(2) .playlist-card")

    # --- ACCIONES ---
    @staticmethod
    def click_create_playlist():
        """Click the button to open the 'Create Playlist' modal."""
        return Click.on(PlaylistsPage.CREATE_PLAYLIST_BUTTON)

    @staticmethod
    def close_create_playlist_modal():
        """Click the 'close' button to close the modal."""
        return Click.on(PlaylistsPage.CLOSE_MODAL_BUTTON)

    @staticmethod
    def enter_playlist_name(name: str):
        """Enter the playlist name in the modal."""
        return Enter.the_text(name).into(PlaylistsPage.PLAYLIST_NAME_INPUT)

    @staticmethod
    def select_first_song():
        """Select the first song available inside the modal."""
        return Click.on(PlaylistsPage.SONG_CARD)

    @staticmethod
    def click_save_playlist():
        """Click the 'Save Playlist' button."""
        return Click.on(PlaylistsPage.SAVE_PLAYLIST_BUTTON)

    @staticmethod
    def click_save_playlist_to_profile():
        """Scroll and click the save playlist button."""
        return Click.on(PlaylistsPage.SAVE_TO_PROFILE_BUTTON)
        
    @staticmethod
    def scroll_to_playlist_save():
        """Scroll to the second user playlist card."""
        return ScrollToElement(PlaylistsPage.SAVE_TO_PROFILE_BUTTON)    

    @staticmethod
    def select_playlist(name: str):
        """Select a playlist by its name."""
        return Click.on(f".playlist-card:contains('{name}')")

    @staticmethod
    def click_delete_playlist():
        """Click the delete playlist button."""
        return Click.on(PlaylistsPage.DELETE_PLAYLIST_BUTTON)

    @staticmethod
    def confirm_delete():
        """Confirm playlist deletion."""
        return Click.on(PlaylistsPage.CONFIRM_DELETE_BUTTON)

    # --- VALIDACIONES ---
    @staticmethod
    def modal_is_visible():
        """Verify the create playlist modal is visible."""
        return See.the(ElementIsVisible(PlaylistsPage.MODAL), IsEqualTo(True))

    @staticmethod
    def user_playlists_are_visible():
        """Verify that user playlists section is visible."""
        return See.the(ElementIsVisible(PlaylistsPage.USER_PLAYLIST_TITLE), IsEqualTo(True))

    @staticmethod
    def automatic_playlists_are_visible():
        """Verify that automatic playlists section is visible."""
        return See.the(ElementIsVisible(PlaylistsPage.AUTO_PLAYLIST_TITLE), IsEqualTo(True))

    @staticmethod
    def url_is(expected_url: str):
        """Verify the user is currently on the playlists page."""
        return See.the(BrowserURL(), IsEqualTo(expected_url))

    @staticmethod
    def get_playlist_name():
        """Get the name of the current playlist."""
        return See.the(Text.of(PlaylistsPage.PLAYLIST_NAME))

    @staticmethod
    def success_message_visible():
        """Verify that the success message is visible."""
        return See.the(ElementIsVisible(PlaylistsPage.SUCCESS_MESSAGE), IsEqualTo(True))

    @staticmethod
    def get_playlist_count():
        """Get the current number of playlists."""
        return See.the(PlaylistCount())
    
    @staticmethod
    def get_first_playlist_name():
        """Return the text of the first playlist displayed."""
        from questions.element_text import ElementText
        return ElementText(PlaylistsPage.PLAYLIST_NAME)
