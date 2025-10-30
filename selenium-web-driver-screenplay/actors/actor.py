from screenpy import Actor
from screenpy_selenium.abilities import BrowseTheWeb
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

from abilities.manage_playlists import ManagePlaylists
from abilities.upload_songs import UploadSongs
from abilities.rate_and_comment import RateAndComment
from abilities.follow_users import FollowUsers
from abilities.search_music import SearchMusic
from abilities.search_users import SearchUsers
from abilities.save_playlist_to_profile import SavePlaylistToProfile


def _create_browser():
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--window-size=1920,1080")

    service = Service()
    driver = webdriver.Chrome(service=service, options=options)
    return driver


def create_standard_user() -> Actor:
    browser = _create_browser()
    return (
        Actor.named("StandardUser")
        .who_can(
            BrowseTheWeb.using(browser),
            RateAndComment.granted(),
            FollowUsers.granted(),
            SearchMusic.granted(),
            SearchUsers.granted(),
        )
    )


def create_premium_user() -> Actor:
    browser = _create_browser()
    return (
        Actor.named("PremiumUser")
        .who_can(
            BrowseTheWeb.using(browser),
            ManagePlaylists.granted(),
            RateAndComment.granted(),
            FollowUsers.granted(),
            SearchMusic.granted(),
            SearchUsers.granted(),
            SavePlaylistToProfile.granted(),
            UploadSongs.granted(),  # habilidad exclusiva
        )
    )

def create_actor_named(name: str) -> Actor:
    browser = _create_browser()
    return Actor.named(name).who_can(BrowseTheWeb.using(browser))
