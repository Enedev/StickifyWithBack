from screenpy_selenium.actions import Open, Wait
from screenpy.resolutions import ContainsTheText
from pages.login_page import LoginPage
from pages.upload_page import UploadPage
from pages.home_page import HomePage
from questions.song_upload_confirmation import SongUploadConfirmation
from questions.comment_visible import CommentVisible
from abilities.upload_songs import UploadSongs
from abilities.rate_and_comment import RateAndComment

def test_upload_song(actor):
    # Login first
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/log-in"),
        LoginPage.enter_username("testuser"),
        LoginPage.enter_password("Test123!"),
        LoginPage.click_login_button()
    )
    
    # Upload song
    actor.whoCan(UploadSongs).attempts_to(
        UploadPage.navigate_to_upload(),
        UploadPage.select_song_file("test_song.mp3"),
        UploadPage.enter_song_title("My Test Song"),
        UploadPage.enter_song_artist("Test Artist"),
        UploadPage.enter_song_genre("Pop"),
        UploadPage.click_upload_button(),
        Wait.for_the(UploadPage.SUCCESS_MESSAGE).to_appear()
    )
    
    # Verify upload
    actor.should_see_that(
        SongUploadConfirmation(), ContainsTheText("My Test Song")
    )

def test_rate_and_comment_song(actor):
    # Login first
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/log-in"),
        LoginPage.enter_username("testuser"),
        LoginPage.enter_password("Test123!"),
        LoginPage.click_login_button()
    )
    
    # Rate and comment on a song
    actor.whoCan(RateAndComment).attempts_to(
        HomePage.search_song("My Test Song"),
        HomePage.select_song("My Test Song"),
        HomePage.set_rating(5),
        HomePage.enter_comment("Great song!"),
        HomePage.submit_rating_and_comment(),
        Wait.for_the(HomePage.SUCCESS_MESSAGE).to_appear()
    )
    
    # Verify rating and comment
    actor.should_see_that(
        CommentVisible("Great song!"), ContainsTheText("Great song!")
    )