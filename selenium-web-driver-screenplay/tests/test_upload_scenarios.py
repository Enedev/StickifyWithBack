from screenpy_selenium.actions import Open, Wait
from screenpy.resolutions import ContainsTheText
from pages.login_page import LoginPage
from pages.upload_page import UploadPage
from questions.element_is_visible import ElementIsVisible
from questions.song_upload_confirmation import SongUploadConfirmation
from abilities.upload_songs import UploadSongs

def test_upload_song_with_all_metadata(actor):
    # Login first
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/log-in"),
        LoginPage.enter_username("testuser"),
        LoginPage.enter_password("Test123!"),
        LoginPage.click_login_button()
    )
    
    # Upload song with complete metadata
    actor.whoCan(UploadSongs).attempts_to(
        UploadPage.navigate_to_upload(),
        UploadPage.select_song_file("complete_song.mp3"),
        UploadPage.enter_song_title("Complete Test Song"),
        UploadPage.enter_song_artist("Test Artist"),
        UploadPage.enter_song_genre("Rock"),
        UploadPage.enter_song_year("2025"),
        UploadPage.enter_song_album("Test Album"),
        UploadPage.select_song_language("English"),
        UploadPage.click_upload_button(),
        Wait.for_the(UploadPage.SUCCESS_MESSAGE).to_appear()
    )
    
    actor.should_see_that(
        SongUploadConfirmation(), ContainsTheText("Complete Test Song")
    )

def test_upload_invalid_file_format(actor):
    # Login first
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/log-in"),
        LoginPage.enter_username("testuser"),
        LoginPage.enter_password("Test123!"),
        LoginPage.click_login_button()
    )
    
    # Try to upload invalid file
    actor.whoCan(UploadSongs).attempts_to(
        UploadPage.navigate_to_upload(),
        UploadPage.select_song_file("invalid_file.txt"),
        Wait.for_the(UploadPage.ERROR_MESSAGE).to_appear()
    )
    
    actor.should_see_that(
        ElementIsVisible(UploadPage.ERROR_MESSAGE)
    )

def test_upload_song_without_optional_fields(actor):
    # Login first
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/log-in"),
        LoginPage.enter_username("testuser"),
        LoginPage.enter_password("Test123!"),
        LoginPage.click_login_button()
    )
    
    # Upload song with only required fields
    actor.whoCan(UploadSongs).attempts_to(
        UploadPage.navigate_to_upload(),
        UploadPage.select_song_file("minimal_song.mp3"),
        UploadPage.enter_song_title("Minimal Test Song"),
        UploadPage.enter_song_artist("Test Artist"),
        UploadPage.click_upload_button(),
        Wait.for_the(UploadPage.SUCCESS_MESSAGE).to_appear()
    )
    
    actor.should_see_that(
        SongUploadConfirmation(), ContainsTheText("Minimal Test Song")
    )

def test_upload_song_cancel_operation(actor):
    # Login first
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/log-in"),
        LoginPage.enter_username("testuser"),
        LoginPage.enter_password("Test123!"),
        LoginPage.click_login_button()
    )
    
    # Start upload and cancel
    actor.whoCan(UploadSongs).attempts_to(
        UploadPage.navigate_to_upload(),
        UploadPage.select_song_file("song_to_cancel.mp3"),
        UploadPage.enter_song_title("Cancelled Song"),
        UploadPage.click_cancel_button(),
        Wait.for_the(UploadPage.UPLOAD_FORM).to_appear()
    )
    
    # Verify form is cleared
    actor.should_see_that(
        ElementIsVisible(UploadPage.EMPTY_FORM)
    )