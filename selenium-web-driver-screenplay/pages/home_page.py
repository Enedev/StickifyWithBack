from screenpy import See
from screenpy_selenium.actions import Click
from screenpy_selenium.questions import Text
from screenpy_selenium.target import Target
from screenpy.resolutions import IsEqualTo, ContainsTheText
from selenium.webdriver.common.by import By

from questions.browser_url import BrowserURL


class HomePage:
    """Page Object representing the Stickify Home Page."""

    # --- ELEMENTOS (Targets) ---
    SONG_CARD = Target.the("song card").located_by("app-song-card")
    SONG_TITLE = Target.the("song title inside card").located_by("app-song-card h3, app-song-card .song-title")
    PAGINATION_NEXT = Target.the("next page button").located_by("app-pagination button.next, .pagination-next")
    PAGINATION_PREV = Target.the("previous page button").located_by("app-pagination button.prev, .pagination-prev")
    MUSIC_RESULTS_SECTION = Target.the("music results section").located_by("#musicResults")
    HEADER_COMPONENT = Target.the("header component").located_by("app-header")
    ASIDE_COMPONENT = Target.the("aside component").located_by("app-aside")
    NAV_COMPONENT = Target.the("navigation component").located_by("app-nav")
    SONG_MODAL = Target.the("song modal").located_by("app-song-modal")

    # --- ACCIONES ---
    @staticmethod
    def open_first_song():
        """Click on the first song card to open its modal."""
        return Click.on(HomePage.SONG_CARD)

    @staticmethod
    def go_to_next_page():
        """Click the pagination 'next' button."""
        return Click.on(HomePage.PAGINATION_NEXT)

    @staticmethod
    def go_to_previous_page():
        """Click the pagination 'previous' button."""
        return Click.on(HomePage.PAGINATION_PREV)

    # --- VALIDACIONES ---
    @staticmethod
    def song_list_is_visible():
        """Verify that the song list is visible."""
        return See.the(Text.of(HomePage.MUSIC_RESULTS_SECTION), ContainsTheText(""))

    @staticmethod
    def song_modal_is_visible():
        """Verify that the song modal is displayed."""
        return See.the(Text.of(HomePage.SONG_MODAL), ContainsTheText(""))

    @staticmethod
    def url_is(expected_url: str):
        """Verify that the user is on the Home page URL."""
        return See.the(BrowserURL(), IsEqualTo(expected_url))

    @staticmethod
    def header_is_visible():
        """Verify the header (search bar) is visible."""
        return See.the(Text.of(HomePage.HEADER_COMPONENT), ContainsTheText(""))

    @staticmethod
    def aside_is_visible():
        """Verify the sidebar (aside) is visible."""
        return See.the(Text.of(HomePage.ASIDE_COMPONENT), ContainsTheText(""))
