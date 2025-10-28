from screenpy import See
from screenpy_selenium.actions import Click, Enter, Wait
from screenpy_selenium.questions import Text
from screenpy_selenium.target import Target
from screenpy.resolutions import IsEqualTo, ContainsTheText
from selenium.webdriver.common.by import By

from questions.browser_url import BrowserURL
from questions.element_is_visible import ElementIsVisible
from questions.user_role import UserRole


class LoginPage:
    """Page Object representing the Stickify Login Page."""

    # --- ELEMENTOS (Targets) ---
    EMAIL_FIELD = Target.the("email field").located_by("input[formControlName='email']")
    PASSWORD_FIELD = Target.the("password field").located_by("input[formControlName='password']")
    LOGIN_BUTTON = Target.the("login button").located_by("button[type='submit']")
    SIGN_UP_LINK = Target.the("sign-up link").located_by("a[routerLink='/sign-up']")
    BACK_BUTTON = Target.the("back button").located_by("a.button.secondary")
    TITLE_TEXT = Target.the("login title").located_by("h1")
    ERROR_MESSAGE = Target.the("error message").located_by(".swal2-html-container")
    SWEET_ALERT_OK_BUTTON = Target.the("sweet alert OK button").located_by(".swal2-confirm")

    # --- ACCIONES ---
    @staticmethod
    def enter_email(email: str):
        """Type the email into the email input field."""
        return Enter.the_text(email).into(LoginPage.EMAIL_FIELD)

    @staticmethod
    def enter_password(password: str):
        """Type the password into the password input field."""
        return Enter.the_text(password).into(LoginPage.PASSWORD_FIELD)

    @staticmethod
    def click_login_button():
        """Click the 'Iniciar Sesión' button."""
        return Click.on(LoginPage.LOGIN_BUTTON)

    @staticmethod
    def click_sign_up_link():
        """Click the 'Regístrate' link."""
        return Click.on(LoginPage.SIGN_UP_LINK)

    @staticmethod
    def click_back_button():
        """Click the 'Volver' button."""
        return Click.on(LoginPage.BACK_BUTTON)

    @staticmethod
    def click_sweet_alert_ok():
        """Click the 'OK' button on the SweetAlert modal."""
        return Click.on(LoginPage.SWEET_ALERT_OK_BUTTON)

    # --- VALIDACIONES ---
    @staticmethod
    def title_is(expected_text: str):
        """Verify the page title matches the expected text."""
        return See.the(Text.of(LoginPage.TITLE_TEXT), IsEqualTo(expected_text.strip()))

    @staticmethod
    def title_contains(partial_text: str):
        """Verify the page title contains a part of the expected text."""
        return See.the(Text.of(LoginPage.TITLE_TEXT), ContainsTheText(partial_text.strip()))

    @staticmethod
    def url_is(expected_url: str):
        """Verify that the current browser URL matches the expected login URL."""
        return See.the(BrowserURL(), IsEqualTo(expected_url))

    @staticmethod
    def error_is_visible():
        """Verify that the error message is visible."""
        return See.the(ElementIsVisible(LoginPage.ERROR_MESSAGE), IsEqualTo(True))

    @staticmethod
    def user_has_role(expected_role: str):
        """Verify the user's role."""
        return See.the(UserRole(), ContainsTheText(expected_role))
