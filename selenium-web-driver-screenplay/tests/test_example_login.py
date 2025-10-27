from actors.actor import create_actor_named
from screenpy import See
from screenpy_selenium.actions import Open, Wait
from screenpy.resolutions import ContainsTheText

from pages.login_page import LoginPage

def test_login():
    user = create_actor_named("Tester")

    user.attempts_to(
        Open.browser_on("https://the-internet.herokuapp.com/login"),
        LoginPage.enter_username("tomsmith"),
        LoginPage.enter_password("SuperSecretPassword!"),
        LoginPage.click_login_button(),
        Wait.for_the(LoginPage.FLASH_MESSAGE).to_appear(),
        LoginPage.url_is("https://the-internet.herokuapp.com/secure"),
        LoginPage.flash_message_contains("You logged into a secure area!")
    )

