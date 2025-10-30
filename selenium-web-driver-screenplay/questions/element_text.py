from screenpy.protocols import Answerable
from screenpy_selenium.abilities import BrowseTheWeb

class ElementText(Answerable):

    def __init__(self, locator: tuple):
        self.locator = locator

    def answered_by(self, actor):
        browser = actor.ability_to(BrowseTheWeb)
        element = browser.browser.find_element(*self.locator)
        return element.text

    def __str__(self):
        return f"the text of element {self.locator}"
