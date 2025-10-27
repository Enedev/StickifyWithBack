from screenpy import See
from screenpy_selenium.actions import Click, Enter
from screenpy_selenium.questions import Text
from screenpy_selenium.target import Target
from screenpy.resolutions import IsEqualTo, ContainsTheText
from selenium.webdriver.common.by import By

from questions.browser_url import BrowserURL


class UserFollowsPage:
    """Page Object representing the 'User Follows' page in Stickify."""

    # --- ELEMENTOS (Targets) ---
    SEARCH_INPUT = Target.the("search input field").located_by("input.search-input")
    USER_CARD = Target.the("user card").located_by(".user-card")
    USER_NAME = Target.the("user name").located_by(".user-card h3")
    USER_EMAIL = Target.the("user email").located_by(".user-card p")
    FOLLOW_BUTTON = Target.the("follow button").located_by(".follow-button")
    NO_USERS_MESSAGE = Target.the("no users message").located_by(".no-users-message")
    TITLE_SECTION = Target.the("search section title").located_by(".search-section h2")

    # --- ACCIONES ---
    @staticmethod
    def search_for_user(search_term: str):
        """Enter a search term to filter users by name or email."""
        return Enter.the_text(search_term).into(UserFollowsPage.SEARCH_INPUT)

    @staticmethod
    def click_follow_button():
        """Click the 'Seguir' button on a user card."""
        return Click.on(UserFollowsPage.FOLLOW_BUTTON)

    @staticmethod
    def click_unfollow_button():
        """Click the 'Dejar de Seguir' button on a user card."""
        return Click.on(UserFollowsPage.FOLLOW_BUTTON)

    # --- VALIDACIONES ---
    @staticmethod
    def title_is(expected_text: str):
        """Verify the page title matches exactly."""
        return See.the(Text.of(UserFollowsPage.TITLE_SECTION), IsEqualTo(expected_text.strip()))

    @staticmethod
    def title_contains(partial_text: str):
        """Verify the title contains the expected phrase."""
        return See.the(Text.of(UserFollowsPage.TITLE_SECTION), ContainsTheText(partial_text.strip()))

    @staticmethod
    def user_card_is_visible():
        """Check if at least one user card is visible."""
        return See.the(Text.of(UserFollowsPage.USER_NAME), ContainsTheText(""))

    @staticmethod
    def no_users_message_is(expected_text: str):
        """Verify the 'no users found' message."""
        return See.the(Text.of(UserFollowsPage.NO_USERS_MESSAGE), IsEqualTo(expected_text.strip()))

    @staticmethod
    def url_is(expected_url: str):
        """Verify the current URL matches the follows page."""
        return See.the(BrowserURL(), IsEqualTo(expected_url))
