from screenpy import See
from screenpy_selenium.actions import Click, Enter
from screenpy_selenium.questions import Text
from screenpy_selenium.target import Target
from screenpy.resolutions import IsEqualTo, ContainsTheText
from selenium.webdriver.common.by import By

from questions.browser_url import BrowserURL


class PlaylistsPage:
    """Page Object representing the Stickify Playlists Page."""

    # --- ELEMENTOS (Targets) ---
    CREATE_PLAYLIST_BUTTON = Target.the("create playlist button").located_by(".create-playlist-button")
    MODAL = Target.the("playlist creation modal").located_by(".modal")
    CLOSE_MODAL_BUTTON = Target.the("close modal button").located_by(".modal .close")
    PLAYLIST_NAME_INPUT = Target.the("playlist name input").located_by(".playlist-name-input")
    SONG_CARD = Target.the("song card in modal").located_by(".songs-grid .song-card")
    SAVE_PLAYLIST_BUTTON = Target.the("save playlist button").located_by(".save-playlist")

    # Sección de playlists de usuarios
    USER_PLAYLIST_TITLE = Target.the("user playlists section title").located_by("h1.playlist-title:nth-of-type(1)")
    USER_PLAYLIST_CARD = Target.the("user playlist card").located_by(".playlist-grid:nth-of-type(1) .playlist-card")
    SAVE_TO_PROFILE_BUTTON = Target.the("save playlist to profile button").located_by(".save-playlist-profile")

    # Sección de playlists automáticas
    AUTO_PLAYLIST_TITLE = Target.the("automatic playlists section title").located_by("h1.playlist-title:nth-of-type(2)")
    AUTO_PLAYLIST_CARD = Target.the("automatic playlist card").located_by(".playlist-grid:nth-of-type(2) .playlist-card")

    # --- ACCIONES ---
    @staticmethod
    def open_create_playlist_modal():
        """Click the button to open the 'Create Playlist' modal."""
        return Click.on(PlaylistsPage.CREATE_PLAYLIST_BUTTON)

    @staticmethod
    def close_create_playlist_modal():
        """Click the 'close' (×) button to close the modal."""
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
        """Click the 'Guardar Playlist' button."""
        return Click.on(PlaylistsPage.SAVE_PLAYLIST_BUTTON)

    @staticmethod
    def click_save_playlist_to_profile():
        """Click the 'Guardar en Perfil' button on a playlist card."""
        return Click.on(PlaylistsPage.SAVE_TO_PROFILE_BUTTON)

    # --- VALIDACIONES ---
    @staticmethod
    def modal_is_visible():
        """Verify the create playlist modal is visible."""
        return See.the(Text.of(PlaylistsPage.MODAL), ContainsTheText(""))

    @staticmethod
    def user_playlists_are_visible():
        """Verify that user playlists section is visible."""
        return See.the(Text.of(PlaylistsPage.USER_PLAYLIST_TITLE), ContainsTheText("Playlists creadas"))

    @staticmethod
    def automatic_playlists_are_visible():
        """Verify that automatic playlists section is visible."""
        return See.the(Text.of(PlaylistsPage.AUTO_PLAYLIST_TITLE), ContainsTheText("Playlists Automáticas"))

    @staticmethod
    def url_is(expected_url: str):
        """Verify the user is currently on the playlists page."""
        return See.the(BrowserURL(), IsEqualTo(expected_url))
