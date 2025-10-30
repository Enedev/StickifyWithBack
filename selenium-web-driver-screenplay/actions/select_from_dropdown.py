from selenium.webdriver.support.ui import Select
from screenpy import Action
from screenpy_selenium.abilities import BrowseTheWeb

class SelectFromDropdown(Action):

    def __init__(self, locator: tuple, option_text: str):
        self.locator = locator
        self.option_text = option_text

    def perform_as(self, actor):
        browser = actor.ability_to(BrowseTheWeb)
        element = browser.driver.find_element(*self.locator)
        select = Select(element)
        select.select_by_visible_text(self.option_text)
