from screenpy import See
from screenpy_selenium.actions import Enter
from screenpy_selenium.questions import Text
from screenpy_selenium.target import Target
from screenpy.resolutions import IsEqualTo
from selenium.webdriver.common.by import By

from questions.element_is_visible import ElementIsVisible
from questions.element_text import ElementText


class UserFollowsPage:
    """Page Object representing the 'User Follows' page in Stickify."""

    # --- STATIC ELEMENTS ---
    SEARCH_INPUT = Target.the("search input field").located_by("input.search-input")
    USER_CARD = Target.the("user card").located_by("div.user-card")
    USER_EMAIL = Target.the("user email").located_by(".user-card p")
    NO_USERS_MESSAGE = Target.the("no users message").located_by("p.no-users-message")
    SEARCH_RESULTS = Target.the("search results container").located_by("div.user-list")

    # --- DYNAMIC LOCATORS ---
    @staticmethod
    def get_follow_button_for_email(email: str):
        """Locate the follow/unfollow button for a specific user."""
        return Target.the(f"follow button for {email}").located_by(
            f"//div[contains(@class, 'user-card')][.//p[text()='{email}']]//button[contains(@class, 'follow-button')]"
        )

    @staticmethod
    def get_unfollow_button_for_email(email: str):
        """Locate the unfollow button for a specific user."""
        return Target.the(f"unfollow button for {email}").located_by(
            f"//div[contains(@class, 'user-card')][.//p[text()='{email}']]//button[contains(@class, 'unfollow')]"
        )

    @staticmethod
    def get_follow_button_only_for_email(email: str):
        """Locate the follow button for a specific user."""
        return Target.the(f"follow button for {email}").located_by(
            f"//div[contains(@class, 'user-card')][.//p[text()='{email}']]//button[contains(@class, 'follow')]"
        )

    # --- ACTIONS ---
    @staticmethod
    def search_for_user(search_term: str):
        """Enter text into the search input (filters the list)."""
        return Enter.the_text(search_term).into(UserFollowsPage.SEARCH_INPUT)

    # --- VALIDATIONS ---
    @staticmethod
    def no_users_message_is(expected_text: str):
        """Check if the 'no users found' message is visible with expected text."""
        return See.the(ElementText(UserFollowsPage.NO_USERS_MESSAGE), IsEqualTo(expected_text.strip()))

    @staticmethod
    def is_following_user(email: str):
        """Assert that the specific user's button shows the 'unfollow' state."""
        return See.the(
            ElementIsVisible(UserFollowsPage.get_unfollow_button_for_email(email)),
            IsEqualTo(True),
        )

    @staticmethod
    def is_not_following_user(email: str):
        """Assert that the specific user's button shows the 'follow' state."""
        return See.the(
            ElementIsVisible(UserFollowsPage.get_follow_button_only_for_email(email)),
            IsEqualTo(True),
        )
