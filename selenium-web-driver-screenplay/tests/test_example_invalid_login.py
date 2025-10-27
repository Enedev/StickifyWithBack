from screenpy_selenium.actions import Open, Wait
from screenpy.resolutions import ContainsTheText
from pages.login_page import LoginPage

def test_invalid_login(actor):  # ← Usa el fixture
    actor.attempts_to(
        Open.browser_on("https://the-internet.herokuapp.com/login"),
        LoginPage.enter_username("invalidUser"),
        LoginPage.enter_password("invalidPassword!"),
        LoginPage.click_login_button(),
        Wait.for_the(LoginPage.FLASH_MESSAGE).to_appear(),
        LoginPage.flash_message_contains("Your username is invalid!")
    )
