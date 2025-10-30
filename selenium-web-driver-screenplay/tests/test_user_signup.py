from screenpy import See
from screenpy_selenium.actions import Open, Wait
from screenpy.resolutions import ContainsTheText, IsEqualTo
from screenpy_selenium.questions import Text
from time import sleep
from pages.signup_page import SignUpPage
from questions.element_is_visible import ElementIsVisible
from questions.browser_url import BrowserURL
import random
def test_successful_signup(actor):
    # Perform the form submission and handle the two-step SweetAlert flow:
    # 1) confirmation ("No has activado el modo Premium...") -> click OK
    # 2) result modal (success) -> assert text and click OK
    randomNumber = str(random.randint(1000, 9999))
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/sign-up"),
        SignUpPage.enter_username("newuser"+randomNumber),
        SignUpPage.enter_email("newuser"+randomNumber+"1234@example.com"),
        SignUpPage.enter_password("Test1234!"),
        SignUpPage.enter_repeat_password("Test1234!"),
        SignUpPage.click_signup_button(),
        # Click confirmation
        Wait.for_the(SignUpPage.SWEET_ALERT_OK_BUTTON).to_appear(),
        SignUpPage.click_sweet_alert_ok(),
    )

    # Wait briefly for the result modal to show up
    sleep(0.5)
    actor.attempts_to(
        Wait.for_the(SignUpPage.SWEET_ALERT_OK_BUTTON).to_appear()
    )

    # Assert the modal contains success text, then click OK to close
    actor.should(
        See.the(Text.of(SignUpPage.SUCCESS_MESSAGE), ContainsTheText("Registro exitoso"))
    )

    actor.attempts_to(
        SignUpPage.click_sweet_alert_ok()
    )

    # Allow redirect after closing modal
    sleep(1)

    actor.should(
        See.the(BrowserURL(), ContainsTheText("/log-in"))
    )

def test_invalid_signup_existing_user(actor):
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/sign-up"),
        SignUpPage.enter_username("pol"),
        SignUpPage.enter_email("pol@correo.com"),
        SignUpPage.enter_password("Test123!"),
        SignUpPage.enter_repeat_password("Test123!"),
        SignUpPage.click_signup_button(),
        # Wait for the confirmation modal content and click "Sí, registrarme sin Premium"
        Wait.for_the(SignUpPage.SWEET_ALERT_OK_BUTTON).to_appear(),
        # Optionally assert the confirmation text is present before clicking
        # (the modal content uses the same container target)
        # Then click the confirm button to proceed without Premium
        SignUpPage.click_sweet_alert_ok(),
    )

    # Wait for the result modal (error) to appear
    sleep(0.5)
    actor.attempts_to(
        Wait.for_the(SignUpPage.SWEET_ALERT_OK_BUTTON).to_appear()
    )

    # The result modal contains the error text; assert it and then close it
    actor.should(
        See.the(Text.of(SignUpPage.ERROR_MESSAGE), ContainsTheText("Este correo electrónico ya está registrado."))
    )

    actor.attempts_to(
        SignUpPage.click_sweet_alert_ok()
    )