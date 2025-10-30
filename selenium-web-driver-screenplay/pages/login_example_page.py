from screenpy import See
from screenpy_selenium.actions import Click, Enter
from screenpy_selenium.questions import Text
from screenpy_selenium.target import Target
from selenium.webdriver.common.by import By
from screenpy.resolutions import IsEqualTo, ContainsTheText  # <-- Import adicional

from questions.browser_url import BrowserURL

class LoginPage:
    USERNAME_FIELD = Target.the("username field").located_by("#username")
    PASSWORD_FIELD = Target.the("password field").located_by("#password")
    LOGIN_BUTTON = Target.the("login button").located_by("button[type='submit']")
    FLASH_MESSAGE = Target.the("flash message").located_by("#flash")

    @staticmethod
    def enter_username(username: str):
        return Enter.the_text(username).into(LoginPage.USERNAME_FIELD)

    @staticmethod
    def enter_password(password: str):
        return Enter.the_text(password).into(LoginPage.PASSWORD_FIELD)

    @staticmethod
    def click_login_button():
        return Click.on(LoginPage.LOGIN_BUTTON)

    @staticmethod
    def url_is(expected_url: str):
        return See.the(BrowserURL(), IsEqualTo(expected_url))

    @staticmethod
    def flash_message_is(expected_text: str):
        """Validación estricta: requiere texto exacto."""
        return See.the(Text.of(LoginPage.FLASH_MESSAGE), IsEqualTo(expected_text.strip()))

    @staticmethod
    def flash_message_contains(partial_text: str):
        """Validación más flexible: acepta parte del mensaje."""
        return See.the(Text.of(LoginPage.FLASH_MESSAGE), ContainsTheText(partial_text.strip()))
