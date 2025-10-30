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
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/log-in"),
        LoginPage.enter_email("pol@correo.com"),
        LoginPage.enter_password("pol123"),
        LoginPage.click_login_button(),
        Wait(10).for_the(LoginPage.SWEET_ALERT_OK_BUTTON).to_appear(),
        LoginPage.click_sweet_alert_ok(),
    )
    time.sleep(2)
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/upload"),
        Wait(10).for_the(UploadPage.UPLOAD_FORM).to_appear(),
    )


def test_upload_form_display(actor):
    login_and_go_to_upload(actor)

    actor.should(See.the(BrowserURL(), ContainsTheText("upload")))

    actor.should(UploadPage.upload_form_visible())
    actor.should(UploadPage.title_contains("Subir Nueva Canción"))



def test_upload_song_success(actor):
    login_and_go_to_upload(actor)

    cover_image_path = os.path.abspath(os.path.join("assets", "linkinparktest.jpg"))

    actor.attempts_to(
        UploadPage.enter_artist_name("Test Artist"),
        UploadPage.enter_track_name("Test Track linkin park Title"),
        UploadPage.enter_album_name("Test Album"),
        UploadPage.enter_genre("Rock"),
        UploadPage.upload_cover_image(cover_image_path),
        Wait(5).for_the(UploadPage.PREVIEW_IMAGE).to_appear(),
    )

    actor.should(UploadPage.cover_preview_is_visible())

    actor.attempts_to(
    UploadPage.click_upload_button(),
    Wait(10).for_the(UploadPage.LOADER_ALERT).to_appear(),
    Wait(30).for_the(UploadPage.LOADER_ALERT).to_disappear(),
    Wait(10).for_the(UploadPage.SWEET_ALERT).to_appear(),
)

    actor.should(UploadPage.upload_successful("Test Track linkin park Title"))

    actor.attempts_to(
        Click.on(UploadPage.SWEET_ALERT_OK_BUTTON),
    )
    actor.should(
        See.the(BrowserURL(), ContainsTheText("home"))
    )
    
def test_upload_missing_fields_shows_no_success(actor):

    login_and_go_to_upload(actor)

    cover_image_path = os.path.abspath(os.path.join("assets", "linkinparktest.jpg"))  # <-- adjust to your env
    actor.attempts_to(
        UploadPage.upload_cover_image(cover_image_path),
        Wait(5).for_the(UploadPage.PREVIEW_IMAGE).to_appear(),
    )

    actor.should(UploadPage.cover_preview_is_visible())

    actor.attempts_to(UploadPage.click_upload_button())

    time.sleep(2)
    try:
        actor.should(See.the(SongUploadConfirmation(), ContainsTheText("Test Track Title")))
        assert False, "Upload succeeded unexpectedly when required fields were missing."
    except AssertionError:
        pass
