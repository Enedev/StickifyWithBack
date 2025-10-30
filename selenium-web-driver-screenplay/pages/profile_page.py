from screenpy import See
from screenpy_selenium.actions import Click, Wait
from screenpy_selenium.questions import Text
from screenpy_selenium.target import Target
from screenpy.resolutions import IsEqualTo, ContainsTheText
from selenium.webdriver.common.by import By

from questions.browser_url import BrowserURL
from questions.element_is_visible import ElementIsVisible
from questions.element_text import ElementText
from questions.user_role import UserRole
from screenpy_selenium.questions import Text


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
    #SAVED_PLAYLIST_NAME = Target.the("saved playlist name").located_by(".playlist-card h4")

    # Botones de acción
    PREMIUM_BUTTON = Target.the("premium button").located_by("#premiumBtn")
    LOGOUT_BUTTON = Target.the("logout button").located_by("#logoutBtn")
    HOME_BUTTON = Target.the("home button").located_by("a.home-btn")

    # Modal Premium
    PREMIUM_MODAL = Target.the("premium modal").located_by("app-premium-payment")

    
    SAVED_PLAYLIST_GRID = Target.the("grid of saved playlists").located_by(".playlist-grid")
    SAVED_PLAYLIST_CARDS = Target.the("playlist cards").located_by(".playlist-card")
    #SAVED_PLAYLIST_NAMES = Target.the("playlist names").located_by(".playlist-card .playlist-info h4")
    SAVED_PLAYLIST_NAME = Target.the("saved playlist name").located_by(".playlist-card .playlist-info h4")
    SAVED_PLAYLIST_NAMES = Target.the("playlist names").located_by(".playlist-card .playlist-info h4")

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
        return See.the(ElementText(ProfilePage.TITLE), IsEqualTo(expected_text.strip()))

    @staticmethod
    def title_contains(partial_text: str):
        """Verify the title contains the expected phrase."""
        return See.the(ElementText(ProfilePage.TITLE), ContainsTheText(partial_text.strip()))

    @staticmethod
    def verified_badge_is_visible():
        """Check if the verified account badge is visible."""
        return See.the(ElementIsVisible(ProfilePage.VERIFIED_BADGE), IsEqualTo(True))
    

    @staticmethod
    def saved_playlist_name():
        """Return the text of the saved playlist names."""
        return Text.of(ProfilePage.SAVED_PLAYLIST_NAMES)

    @staticmethod
    def username_is(expected_username: str):
        """Verify that the displayed username matches the expected one."""
        return See.the(ElementText(ProfilePage.USERNAME), IsEqualTo(expected_username.strip()))

    @staticmethod
    def email_is(expected_email: str):
        """Verify that the displayed email matches the expected one."""
        return See.the(ElementText(ProfilePage.EMAIL), IsEqualTo(expected_email.strip()))

    @staticmethod
    def saved_playlists_are_visible():
        """Check if the saved playlists grid is visible."""
        return See.the(ElementIsVisible(ProfilePage.SAVED_PLAYLIST_GRID), IsEqualTo(True))


    @staticmethod
    def no_saved_playlists_message(expected_text: str):
        """Verify the message when no playlists are saved."""
        return See.the(ElementText(ProfilePage.SAVED_PLAYLISTS_TITLE), ContainsTheText(expected_text.strip()))


    @staticmethod
    def saved_playlists_are_visible():
        """Check if the saved playlists grid is visible."""
        return See.the(ElementIsVisible(ProfilePage.SAVED_PLAYLIST_GRID), IsEqualTo(True))

    @staticmethod
    def premium_modal_is_visible():
        """Check if the Premium modal is displayed."""
        return See.the(ElementIsVisible(ProfilePage.PREMIUM_MODAL), IsEqualTo(True))

    @staticmethod
    def url_is(expected_url: str):
        """Verify the profile page URL is correct."""
        return See.the(BrowserURL(), IsEqualTo(expected_url))

    @staticmethod
    def user_has_role(expected_role: str):
        """Verify the user's role."""
        return See.the(UserRole(), ContainsTheText(expected_role))
    
    @staticmethod
    def saved_playlist_with_name(playlist_name: str):
        """Return a Target for a saved playlist card with the specific name."""
        return Target.the(f"saved playlist '{playlist_name}'").located_by(
            (By.XPATH, f"//div[contains(@class, 'playlist-card')]//div[contains(@class, 'playlist-info')]//h4[contains(text(), '{playlist_name}')]")
        )