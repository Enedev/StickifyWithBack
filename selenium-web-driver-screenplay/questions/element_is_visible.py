from screenpy.protocols import Answerable
from screenpy_selenium.abilities import BrowseTheWeb
from selenium.common.exceptions import NoSuchElementException

class ElementIsVisible(Answerable):

    def __init__(self, locator: tuple):
        self.locator = locator

    def answered_by(self, actor):
        browser = actor.ability_to(BrowseTheWeb)
        try:
            element = browser.browser.find_element(*self.locator)
            return element.is_displayed()
        except NoSuchElementException:
            return False

    def __str__(self):
        return f"visibility of element {self.locator}"
