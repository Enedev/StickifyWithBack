from screenpy import See
from screenpy_selenium.actions import Click, Enter
from screenpy_selenium.questions import Text
from screenpy_selenium.target import Target
from screenpy.resolutions import IsEqualTo, ContainsTheText
from selenium.webdriver.common.by import By

from questions.browser_url import BrowserURL


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
