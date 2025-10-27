# en test_duckduckgo_search.py

from actors.actor import create_actor_named
from screenpy import See
from screenpy_selenium.actions import Open, Enter, Wait
from screenpy.resolutions import ContainsTheText
from screenpy_selenium.target import Target
from selenium.webdriver.common.keys import Keys

from questions.browser_url import BrowserURL
from questions.page_title import PageTitle


class DuckDuckGoHomePage:
    SEARCH_BOX = Target.the("search box").located_by("input[name='q']")

    @staticmethod
    def title_contains(expected_part: str):
        return See.the(PageTitle(), ContainsTheText(expected_part))

    @staticmethod
    def url_contains(keyword: str):
        return See.the(BrowserURL(), ContainsTheText(keyword))


def test_duckduckgo_search():
    user = create_actor_named("User")

    user.attempts_to(
        Open.browser_on("https://duckduckgo.com/?kl=us-en"),
        Wait.for_the(DuckDuckGoHomePage.SEARCH_BOX).to_appear(),
        DuckDuckGoHomePage.title_contains("DuckDuckGo"),
        Enter.the_text("ScreenPy\n").into(DuckDuckGoHomePage.SEARCH_BOX),
        DuckDuckGoHomePage.url_contains("ScreenPy")
    )
