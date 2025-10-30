from screenpy import See
from screenpy_selenium.actions import Click, Enter, Wait
from screenpy_selenium.questions import Text
from screenpy_selenium.target import Target
from screenpy.resolutions import IsEqualTo, ContainsTheText
from selenium.webdriver.common.by import By

from questions.browser_url import BrowserURL
from questions.element_is_visible import ElementIsVisible


class SignUpPage:
    """Page Object representing the Stickify Sign-Up Page."""

    # --- ELEMENTOS (Targets) ---
    USERNAME_FIELD = Target.the("username field").located_by("input[formControlName='username']")
    EMAIL_FIELD = Target.the("email field").located_by("input[formControlName='email']")
    PASSWORD_FIELD = Target.the("password field").located_by("input[formControlName='password']")
    REPEAT_PASSWORD_FIELD = Target.the("repeat password field").located_by("input[formControlName='repeatPassword']")
    PREMIUM_BUTTON = Target.the("premium option button").located_by(".premium-option .button")
    SIGNUP_BUTTON = Target.the("sign-up button").located_by("button[type='submit']")
    LOGIN_LINK = Target.the("login link").located_by("a[routerlink='/log-in']")
    BACK_BUTTON = Target.the("back button").located_by("a.button.secondary")
    TITLE_TEXT = Target.the("signup title").located_by("h1")
    # SweetAlert2 modal's content appears in .swal2-html-container
    SUCCESS_MESSAGE = Target.the("success message").located_by(".swal2-html-container")
    # SweetAlert2 is used for error messages as well, so target the modal container
    ERROR_MESSAGE = Target.the("error message").located_by(".swal2-html-container")
    SWEET_ALERT_OK_BUTTON = Target.the("sweet alert OK button").located_by(".swal2-confirm")

    # --- ACCIONES ---
    @staticmethod
    def enter_username(username: str):
        """Type the username into the username field."""
        return Enter.the_text(username).into(SignUpPage.USERNAME_FIELD)

    @staticmethod
    def enter_email(email: str):
        """Type the email into the email field."""
        return Enter.the_text(email).into(SignUpPage.EMAIL_FIELD)

    @staticmethod
    def enter_password(password: str):
        """Type the password into the password field."""
        return Enter.the_text(password).into(SignUpPage.PASSWORD_FIELD)

    @staticmethod
    def enter_repeat_password(password: str):
        """Type the repeated password into the confirm field."""
        return Enter.the_text(password).into(SignUpPage.REPEAT_PASSWORD_FIELD)

    @staticmethod
    def click_premium_button():
        """Click the premium activation button."""
        return Click.on(SignUpPage.PREMIUM_BUTTON)

    @staticmethod
    def click_signup_button():
        """Click the 'Regístrate' button."""
        return Click.on(SignUpPage.SIGNUP_BUTTON)

    @staticmethod
    def click_login_link():
        """Click the 'Iniciar Sesión' link."""
        return Click.on(SignUpPage.LOGIN_LINK)

    @staticmethod
    def click_back_button():
        """Click the 'Volver' button."""
        return Click.on(SignUpPage.BACK_BUTTON)

    @staticmethod
    def click_sweet_alert_ok():
        """Click the 'OK' button on a SweetAlert modal."""
        return Click.on(SignUpPage.SWEET_ALERT_OK_BUTTON)

    # --- VALIDACIONES ---
    @staticmethod
    def title_is(expected_text: str):
        """Verify the title of the page matches exactly."""
        return See.the(Text.of(SignUpPage.TITLE_TEXT), IsEqualTo(expected_text.strip()))

    @staticmethod
    def title_contains(partial_text: str):
        """Verify the title contains the expected phrase."""
        return See.the(Text.of(SignUpPage.TITLE_TEXT), ContainsTheText(partial_text.strip()))

    @staticmethod
    def url_is(expected_url: str):
        """Verify that the current URL matches the expected sign-up route."""
        return See.the(BrowserURL(), IsEqualTo(expected_url))

    @staticmethod
    def success_message_visible():
        """Verify that the success message is visible."""
        return See.the(ElementIsVisible(SignUpPage.SUCCESS_MESSAGE), IsEqualTo(True))

    @staticmethod
    def error_message_visible():
        """Verify that the error message is visible."""
        return See.the(ElementIsVisible(SignUpPage.ERROR_MESSAGE), IsEqualTo(True))
