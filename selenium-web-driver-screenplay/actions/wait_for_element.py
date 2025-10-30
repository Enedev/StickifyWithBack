from screenpy import Action
from screenpy_selenium.abilities import BrowseTheWeb
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class WaitForElement(Action):

    def __init__(self, locator: tuple, timeout: int = 10):
        self.locator = locator
        self.timeout = timeout

    def perform_as(self, actor):
        browser = actor.ability_to(BrowseTheWeb)
        WebDriverWait(browser.driver, self.timeout).until(
            EC.visibility_of_element_located(self.locator)
        )
