from screenpy import Action
from screenpy_selenium.abilities import BrowseTheWeb
from selenium.webdriver import ActionChains

class HoverOver(Action):

    def __init__(self, locator: tuple):
        self.locator = locator

    def perform_as(self, actor):
        browser = actor.ability_to(BrowseTheWeb)
        element = browser.driver.find_element(*self.locator)
        ActionChains(browser.driver).move_to_element(element).perform()
