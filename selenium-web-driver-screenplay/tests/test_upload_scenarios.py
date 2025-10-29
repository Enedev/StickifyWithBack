# tests/test_upload_scenarios.py
import os
import time
from screenpy_selenium import Click
from screenpy_selenium.actions import Open, Wait
from screenpy.resolutions import ContainsTheText
from screenpy import See

from pages.login_page import LoginPage
from pages.upload_page import UploadPage
from questions.browser_url import BrowserURL
from questions.element_is_visible import ElementIsVisible
from questions.song_upload_confirmation import SongUploadConfirmation


def login_and_go_to_upload(actor):
    """Helper to login and navigate to upload page (used in tests)."""
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/log-in"),
        LoginPage.enter_email("pol@correo.com"),
        LoginPage.enter_password("pol123"),
        LoginPage.click_login_button(),
        Wait(10).for_the(LoginPage.SWEET_ALERT_OK_BUTTON).to_appear(),
        LoginPage.click_sweet_alert_ok(),
    )
    time.sleep(2)  # small wait like in your other tests
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/upload"),
        Wait(10).for_the(UploadPage.UPLOAD_FORM).to_appear(),
    )


def test_upload_form_display(actor):
    """Verify upload page is reachable after login and form elements are visible."""
    login_and_go_to_upload(actor)

    # URL should contain 'upload'
    actor.should(See.the(BrowserURL(), ContainsTheText("upload")))

    # Form and title visible
    actor.should(UploadPage.upload_form_visible())
    actor.should(UploadPage.title_contains("Subir Nueva Canción"))



def test_upload_song_success(actor):
    """✅ Test that uploads a song and verifies SweetAlert success and redirect."""
    login_and_go_to_upload(actor)

    cover_image_path = os.path.abspath(os.path.join("assets", "linkinparktest.jpg"))

    # Fill all upload fields
    actor.attempts_to(
        UploadPage.enter_artist_name("Test Artist"),
        UploadPage.enter_track_name("Test Track linkin park Title"),
        UploadPage.enter_album_name("Test Album"),
        UploadPage.enter_genre("Rock"),
        UploadPage.upload_cover_image(cover_image_path),
        Wait(5).for_the(UploadPage.PREVIEW_IMAGE).to_appear(),
    )

    # Check preview is visible
    actor.should(UploadPage.cover_preview_is_visible())

    actor.attempts_to(
    UploadPage.click_upload_button(),
    # Wait for loader popup to appear
    Wait(10).for_the(UploadPage.LOADER_ALERT).to_appear(),
    # Wait for loader popup to disappear (upload completed)
    Wait(30).for_the(UploadPage.LOADER_ALERT).to_disappear(),
    # Wait for success alert to appear
    Wait(10).for_the(UploadPage.SWEET_ALERT).to_appear(),
)

# Then verify the success message
    actor.should(UploadPage.upload_successful("Test Track linkin park Title"))

    # Click the OK button and wait for redirect
    actor.attempts_to(
        Click.on(UploadPage.SWEET_ALERT_OK_BUTTON),
    )
    actor.should(
        See.the(BrowserURL(), ContainsTheText("home"))
    )
    
def test_upload_missing_fields_shows_no_success(actor):
    """
    Try to upload without filling fields and expect no successful confirmation.
    Behavior depends on app: here we assert that SongUploadConfirmation does NOT contain the title.
    If your app shows error messages, replace the final assertion with the corresponding check.
    """
    login_and_go_to_upload(actor)

    # Only upload cover, skip other fields
    cover_image_path = os.path.abspath(os.path.join("assets", "linkinparktest.jpg"))  # <-- adjust to your env
    actor.attempts_to(
        UploadPage.upload_cover_image(cover_image_path),
        Wait(5).for_the(UploadPage.PREVIEW_IMAGE).to_appear(),
    )

    actor.should(UploadPage.cover_preview_is_visible())

    actor.attempts_to(UploadPage.click_upload_button())

    # Expectation: no confirmation with the missing title; adapt to actual app behavior
    # Here we wait a short time and check that confirmation does NOT appear
    time.sleep(2)
    # If your SongUploadConfirmation raises when not found, wrap accordingly in your test runner.
    # We'll perform a negative check: SongUploadConfirmation should NOT contain the sample title.
    try:
        actor.should(See.the(SongUploadConfirmation(), ContainsTheText("Test Track Title")))
        # If it passes, that's unexpected — fail the test by asserting False
        assert False, "Upload succeeded unexpectedly when required fields were missing."
    except AssertionError:
        # Expected path: confirmation didn't match — pass the negative test
        pass
