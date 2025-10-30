from screenpy import See
from screenpy_selenium.actions import Open, Wait
from screenpy_selenium.questions import Text
from screenpy.resolutions import ContainsTheText, IsEqualTo
from pages.login_page import LoginPage
from pages.home_page import HomePage
from questions.element_is_visible import ElementIsVisible
from questions.browser_url import BrowserURL
from questions.user_role import UserRole

def test_successful_login(actor):
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/log-in"),
        LoginPage.enter_email("pol@correo.com"),
        LoginPage.enter_password("pol123"),
        LoginPage.click_login_button(),
        Wait(10).for_the(LoginPage.SWEET_ALERT_OK_BUTTON).to_appear(),
        LoginPage.click_sweet_alert_ok()
    )
    
    from time import sleep
    sleep(2)
    
    actor.should(
        See.the(BrowserURL(), ContainsTheText("home"))
    )
    
    actor.attempts_to(
        Wait(15).for_the(HomePage.MUSIC_RESULTS).to_appear()
    )
    
    for component_assertion in HomePage.components_are_visible():
        actor.should(component_assertion)

def test_login_with_invalid_password(actor):
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/log-in"),
        LoginPage.enter_email("pol@correo.com"),
        LoginPage.enter_password("wrongpassword"),
        LoginPage.click_login_button(),
        Wait.for_the(LoginPage.ERROR_MESSAGE).to_appear()
    )
    
    actor.should(
        See.the(ElementIsVisible(LoginPage.ERROR_MESSAGE), IsEqualTo(True)),
        See.the(Text.of(LoginPage.ERROR_MESSAGE), ContainsTheText("Correo electrónico o contraseña incorrectos"))
    )

def test_back_button_navigation(actor):
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/log-in"),
        LoginPage.click_back_button(),
    )
    
    actor.should(
        See.the(BrowserURL(), ContainsTheText("/"))
    )