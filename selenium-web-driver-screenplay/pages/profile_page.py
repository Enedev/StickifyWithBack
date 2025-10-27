from screenpy import See
from screenpy_selenium.actions import Click
from screenpy_selenium.questions import Text
from screenpy_selenium.target import Target
from screenpy.resolutions import IsEqualTo, ContainsTheText
from selenium.webdriver.common.by import By

from questions.browser_url import BrowserURL


class ProfilePage:
    """Page Object representing the Stickify Profile Page."""

    # --- ELEMENTOS (Targets) ---

    # Encabezado y datos principales
    TITLE = Target.the("profile title").located_by(".profile-header h1")
    VERIFIED_BADGE = Target.the("verified account badge").located_by(".security-badge")

    USERNAME = Target.the("username text").located_by("#userData .data-row:nth-of-type(1) span:last-child")
    EMAIL = Target.the("email text").located_by("#userData .data-row:nth-of-type(2) span:last-child")

    FOLLOWERS_INFO = Target.the("followers info").located_by(".data-row .follow-info:nth-of-type(1)")
    FOLLOWING_INFO = Target.the("following info").located_by(".data-row .follow-info:nth-of-type(2)")

    RATINGS_SECTION = Target.the("ratings section").located_by(".data-row i.fa-star")
    COMMENTS_SECTION = Target.the("comments section").located_by(".data-row i.fa-comments")

    SAVED_PLAYLISTS_TITLE = Target.the("saved playlists title").located_by(".data-row i.fas.fa-music")
    SAVED_PLAYLIST_CARD = Target.the("saved playlist card").located_by(".playlist-grid .playlist-card")

    # Botones de acción
    PREMIUM_BUTTON = Target.the("premium button").located_by("#premiumBtn")
    LOGOUT_BUTTON = Target.the("logout button").located_by("#logoutBtn")
    HOME_BUTTON = Target.the("home button").located_by("a.home-btn")

    # Modal Premium
    PREMIUM_MODAL = Target.the("premium modal").located_by("app-premium-payment")

    # --- ACCIONES ---

    @staticmethod
    def click_premium_button():
        """Click the button to activate or cancel Premium."""
        return Click.on(ProfilePage.PREMIUM_BUTTON)

    @staticmethod
    def click_logout_button():
        """Click the 'Cerrar Sesión' button."""
        return Click.on(ProfilePage.LOGOUT_BUTTON)

    @staticmethod
    def click_home_button():
        """Click the 'Volver al Inicio' button."""
        return Click.on(ProfilePage.HOME_BUTTON)

    # --- VALIDACIONES ---

    @staticmethod
    def title_is(expected_text: str):
        """Verify the title matches the expected text."""
        return See.the(Text.of(ProfilePage.TITLE), IsEqualTo(expected_text.strip()))

    @staticmethod
    def title_contains(partial_text: str):
        """Verify the title contains the expected phrase."""
        return See.the(Text.of(ProfilePage.TITLE), ContainsTheText(partial_text.strip()))

    @staticmethod
    def verified_badge_is_visible():
        """Check if the verified account badge is visible."""
        return See.the(Text.of(ProfilePage.VERIFIED_BADGE), ContainsTheText("Cuenta verificada"))

    @staticmethod
    def username_is(expected_username: str):
        """Verify that the displayed username matches the expected one."""
        return See.the(Text.of(ProfilePage.USERNAME), IsEqualTo(expected_username.strip()))

    @staticmethod
    def email_is(expected_email: str):
        """Verify that the displayed email matches the expected one."""
        return See.the(Text.of(ProfilePage.EMAIL), IsEqualTo(expected_email.strip()))

    @staticmethod
    def saved_playlists_are_visible():
        """Verify that saved playlists are displayed on the profile."""
        return See.the(Text.of(ProfilePage.SAVED_PLAYLIST_CARD), ContainsTheText(""))

    @staticmethod
    def no_saved_playlists_message(expected_text: str):
        """Verify the message when no playlists are saved."""
        return See.the(Text.of(ProfilePage.SAVED_PLAYLISTS_TITLE), ContainsTheText(expected_text.strip()))

    @staticmethod
    def premium_modal_is_visible():
        """Check if the Premium modal is displayed."""
        return See.the(Text.of(ProfilePage.PREMIUM_MODAL), ContainsTheText(""))

    @staticmethod
    def url_is(expected_url: str):
        """Verify the profile page URL is correct."""
        return See.the(BrowserURL(), IsEqualTo(expected_url))
