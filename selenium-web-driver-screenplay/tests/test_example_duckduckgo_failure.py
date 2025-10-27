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
    def title_contains(expected: str):
        return See.the(PageTitle(), ContainsTheText(expected))

    @staticmethod
    def url_contains(text: str):
        return See.the(BrowserURL(), ContainsTheText(text))


def test_duckduckgo_failure(actor):
    actor.attempts_to(
        Open.browser_on("https://duckduckgo.com/?kl=us-en"),
        Wait.for_the(DuckDuckGoHomePage.SEARCH_BOX).to_appear(),
        DuckDuckGoHomePage.title_contains("This will fail"),  # ❌ No existe en el título
        Enter.the_text("ScreenPy\n").into(DuckDuckGoHomePage.SEARCH_BOX),
        DuckDuckGoHomePage.url_contains("ScreenPy")
    )
