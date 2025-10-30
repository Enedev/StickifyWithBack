from screenpy import See
from screenpy_selenium.actions import Click
from screenpy_selenium.target import Target
from screenpy.resolutions import IsEqualTo
from questions.page_title import PageTitle
from questions.browser_url import BrowserURL

class HomePage:
    LEARN_MORE_BUTTON = Target.the("learn more button").located_by("a[href='https://www.iana.org/help/example-domains']")

    @staticmethod
    def click_learn_more():
        return Click.on(HomePage.LEARN_MORE_BUTTON)

    @staticmethod
    def title_is(expected_title: str):
        return See.the(PageTitle(), IsEqualTo(expected_title))

    @staticmethod
    def url_is(expected_url: str):
        return See.the(BrowserURL(), IsEqualTo(expected_url))
