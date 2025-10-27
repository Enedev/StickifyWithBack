from screenpy import Action
from screenpy_selenium.abilities import BrowseTheWeb

class ScrollToElement(Action):
    """Scrolls the page until the specified element is in view."""

    def __init__(self, locator: tuple):
        self.locator = locator

    def perform_as(self, actor):
        browser = actor.ability_to(BrowseTheWeb)
        element = browser.driver.find_element(*self.locator)
        browser.driver.execute_script("arguments[0].scrollIntoView(true);", element)
