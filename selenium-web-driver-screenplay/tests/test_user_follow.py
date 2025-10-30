from screenpy_selenium.actions import Open, Wait, Click
from screenpy.resolutions import ContainsTheText
from screenpy import See
from screenpy.exceptions import DeliveryError
from pages.login_page import LoginPage
from questions.browser_url import BrowserURL
from pages.user_follows_page import UserFollowsPage
from pages.home_page import HomePage
from time import sleep


def login_and_go_to_follows(actor):
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/log-in"),
        LoginPage.enter_email("pol@correo.com"),
        LoginPage.enter_password("pol123"),
        LoginPage.click_login_button(),
        Wait(5).for_the(LoginPage.SWEET_ALERT_OK_BUTTON).to_appear(),
        LoginPage.click_sweet_alert_ok(),
    )

    actor.should(See.the(BrowserURL(), ContainsTheText("home")))
    actor.attempts_to(Wait(15).for_the(HomePage.MUSIC_RESULTS).to_appear())
    actor.attempts_to(Open.browser_on("http://localhost:4200/user-follows"))
    actor.attempts_to(Wait(10).for_the(UserFollowsPage.SEARCH_RESULTS).to_appear())


def test_search_and_follow_user(actor):
    login_and_go_to_follows(actor)
    target_email = "poorpol@correo.com"

    actor.attempts_to(UserFollowsPage.search_for_user(target_email))
    actor.attempts_to(Wait(10).for_the(UserFollowsPage.USER_CARD).to_appear())

    try:
        actor.should(UserFollowsPage.is_not_following_user(target_email))
    except DeliveryError:
        actor.should(UserFollowsPage.no_users_message_is("No se encontraron otros usuarios."))
        return

    actor.attempts_to(
        Wait(5).for_the(UserFollowsPage.get_follow_button_for_email(target_email)).to_appear(),
        Click.on(UserFollowsPage.get_follow_button_for_email(target_email))
    )

    actor.attempts_to(
        Wait(10).for_the(UserFollowsPage.get_unfollow_button_for_email(target_email)).to_appear()
    )

    actor.should(UserFollowsPage.is_following_user(target_email))


def test_unfollow_user(actor):
    login_and_go_to_follows(actor)
    target_email = "poorpol@correo.com"

    actor.attempts_to(UserFollowsPage.search_for_user(target_email))
    actor.attempts_to(Wait(10).for_the(UserFollowsPage.USER_CARD).to_appear())

    try:
        actor.should(UserFollowsPage.is_following_user(target_email))
    except DeliveryError:
        actor.should(UserFollowsPage.no_users_message_is("No se encontraron otros usuarios."))
        return

    actor.attempts_to(
        Wait(5).for_the(UserFollowsPage.get_follow_button_for_email(target_email)).to_appear(),
        Click.on(UserFollowsPage.get_follow_button_for_email(target_email))
    )

    actor.attempts_to(
        Wait(10).for_the(UserFollowsPage.get_follow_button_only_for_email(target_email)).to_appear()
    )

    actor.should(UserFollowsPage.is_not_following_user(target_email))
