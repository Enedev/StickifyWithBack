import pytest
from screenpy import See
from screenpy_selenium.actions import Open, Wait, Click
from screenpy.resolutions import ContainsTheText, IsEqualTo
from selenium.webdriver.common.by import By
from screenpy_selenium import Target
from pages.playlists_page import PlaylistsPage
from pages.profile_page import ProfilePage
from questions.browser_url import BrowserURL
from pages.login_page import LoginPage
from questions.element_is_visible import ElementIsVisible

@pytest.mark.usefixtures("actor")
def test_save_playlist_to_profile(actor):
    """User can save a playlist to their profile and see it there."""
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/log-in"),
        LoginPage.enter_email("testuserplaylist3@correo.com"),
        LoginPage.enter_password("testuserplaylist3"),
        LoginPage.click_login_button(),
        Wait(10).for_the(LoginPage.SWEET_ALERT_OK_BUTTON).to_appear(),
        LoginPage.click_sweet_alert_ok(),
    )

    from time import sleep
    sleep(2)

    actor.should(See.the(BrowserURL(), ContainsTheText("home")))
    # 1. Go to playlists page
    actor.attempts_to(Open.browser_on("http://localhost:4200/playlist"))

    from time import sleep
    sleep(8)

    actor.should(See.the(BrowserURL(), ContainsTheText("playlist")))

    actor.should(PlaylistsPage.user_playlists_are_visible())

    # 2. Capture the playlist name dynamically (first playlist)
    playlist_name = PlaylistsPage.get_first_playlist_name().answered_by(actor)

    # 3. Save the playlist to profile
    actor.attempts_to(PlaylistsPage.scroll_to_playlist_save())
    actor.attempts_to(PlaylistsPage.click_save_playlist_to_profile())

    # 4. Confirm SweetAlert "OK" button (when song is saved)
    OK_BUTTON = Target.the("SweetAlert OK button").located_by(".swal2-confirm")

    actor.attempts_to(
        Wait.for_the(OK_BUTTON).to_appear(),
        Click.on(OK_BUTTON)
    )
    # 5. Wait until redirected to /profile
    actor.attempts_to(Open.browser_on("http://localhost:4200/profile"))
    actor.should(See.the(BrowserURL(), ContainsTheText("profile")))

    # 6. Wait until saved playlists section appears
    actor.attempts_to(Wait.for_the(ProfilePage.SAVED_PLAYLIST_GRID).to_appear())

    # 7. Verify that the saved playlist name appears in the grid
    actor.attempts_to(
        Wait.for_the(ProfilePage.saved_playlist_with_name(playlist_name)).to_appear()
    )
    # Or use See to verify it's visible
    actor.should(See.the(
        ElementIsVisible(ProfilePage.saved_playlist_with_name(playlist_name)), 
        IsEqualTo(True)
    ))