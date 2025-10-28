from screenpy_selenium.actions import Open, Wait
from screenpy.resolutions import ContainsTheText, IsEqual
from pages.login_page import LoginPage
from pages.playlists_page import PlaylistsPage
from questions.playlist_count import PlaylistCount
from abilities.manage_playlists import ManagePlaylists

def test_create_playlist(actor):
    # Login first
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/log-in"),
        LoginPage.enter_username("testuser"),
        LoginPage.enter_password("Test123!"),
        LoginPage.click_login_button(),
        Wait.for_the(PlaylistsPage.CREATE_PLAYLIST_BUTTON).to_appear()
    )
    
    # Create new playlist
    actor.whoCan(ManagePlaylists).attempts_to(
        PlaylistsPage.click_create_playlist(),
        PlaylistsPage.enter_playlist_name("My Test Playlist"),
        PlaylistsPage.click_save_playlist(),
        Wait.for_the(PlaylistsPage.SUCCESS_MESSAGE).to_appear()
    )
    
    # Verify playlist is created
    actor.should_see_that(
        PlaylistsPage.get_playlist_name(), ContainsTheText("My Test Playlist")
    )

def test_delete_playlist(actor):
    # Login first
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/log-in"),
        LoginPage.enter_username("testuser"),
        LoginPage.enter_password("Test123!"),
        LoginPage.click_login_button()
    )
    
    initial_count = actor.should_see_that(PlaylistCount())
    
    # Delete playlist
    actor.whoCan(ManagePlaylists).attempts_to(
        PlaylistsPage.select_playlist("My Test Playlist"),
        PlaylistsPage.click_delete_playlist(),
        PlaylistsPage.confirm_delete(),
        Wait.for_the(PlaylistsPage.SUCCESS_MESSAGE).to_appear()
    )
    
    # Verify playlist is deleted
    new_count = actor.should_see_that(PlaylistCount())
    assert new_count == initial_count - 1