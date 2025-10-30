from screenpy_selenium.actions import Open, Wait
from screenpy.resolutions import ContainsTheText
from pages.login_page import LoginPage
from pages.home_page import HomePage
from questions.browser_url import BrowserURL
from screenpy import See


def test_home_page_components(actor):
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/log-in"),
        LoginPage.enter_email("pol@correo.com"),
        LoginPage.enter_password("pol123"),
        LoginPage.click_login_button(),
        Wait(10).for_the(LoginPage.SWEET_ALERT_OK_BUTTON).to_appear(),
        LoginPage.click_sweet_alert_ok(),
    )

    from time import sleep
    sleep(2)

    actor.should(See.the(BrowserURL(), ContainsTheText("home")))
    actor.attempts_to(Wait(15).for_the(HomePage.MUSIC_RESULTS).to_appear())

    for component_assertion in HomePage.components_are_visible():
        actor.should(component_assertion)


def test_song_search_functionality(actor):
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/log-in"),
        LoginPage.enter_email("pol@correo.com"),
        LoginPage.enter_password("pol123"),
        LoginPage.click_login_button(),
        Wait(10).for_the(LoginPage.SWEET_ALERT_OK_BUTTON).to_appear(),
        LoginPage.click_sweet_alert_ok(),
    )

    from time import sleep
    sleep(2)

    actor.should(See.the(BrowserURL(), ContainsTheText("home")))
    actor.attempts_to(Wait(15).for_the(HomePage.MUSIC_RESULTS).to_appear())

    search_term = "lose yourself"

    actor.attempts_to(
        *HomePage.enter_search_term(search_term),
        Wait(10).for_the(HomePage.SONG_CARD).to_appear()
    )

    actor.should(HomePage.has_songs_displayed())


def test_song_modal_interaction(actor):
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/log-in"),
        LoginPage.enter_email("pol@correo.com"),
        LoginPage.enter_password("pol123"),
        LoginPage.click_login_button(),
        Wait(10).for_the(LoginPage.SWEET_ALERT_OK_BUTTON).to_appear(),
        LoginPage.click_sweet_alert_ok(),
    )

    from time import sleep
    sleep(2)

    actor.should(See.the(BrowserURL(), ContainsTheText("home")))
    actor.attempts_to(Wait(15).for_the(HomePage.MUSIC_RESULTS).to_appear())

    actor.attempts_to(
        *HomePage.open_first_song()
    )

    actor.should(HomePage.song_modal_is_visible())

    actor.attempts_to(
        HomePage.rate_song(5),
        HomePage.enter_comment("Great song!"),
        HomePage.submit_comment(),
        HomePage.close_song_modal()
    )


def test_song_filtering(actor):
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/log-in"),
        LoginPage.enter_email("pol@correo.com"),
        LoginPage.enter_password("pol123"),
        LoginPage.click_login_button(),
        Wait(10).for_the(LoginPage.SWEET_ALERT_OK_BUTTON).to_appear(),
        LoginPage.click_sweet_alert_ok(),
    )

    from time import sleep
    sleep(2)

    actor.should(See.the(BrowserURL(), ContainsTheText("home")))
    actor.attempts_to(Wait(15).for_the(HomePage.MUSIC_RESULTS).to_appear())

    actor.attempts_to(
        *HomePage.select_year("2024"),
        *HomePage.select_genre("Drama"),
        Wait(10).for_the(HomePage.SONG_CARD).to_appear()
    )

    actor.should(HomePage.has_songs_displayed())
