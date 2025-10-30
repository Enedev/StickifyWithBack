from screenpy import Action
from screenpy_selenium.abilities import BrowseTheWeb

class ClearField(Action):
    """Allows the actor to clear the text of an input field."""

    def __init__(self, locator: tuple):
        self.locator = locator

    def perform_as(self, actor):
        browser = actor.ability_to(BrowseTheWeb)
        element = browser.driver.find_element(*self.locator)
        element.clear()
