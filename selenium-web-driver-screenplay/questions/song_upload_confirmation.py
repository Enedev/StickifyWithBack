from screenpy.protocols import Answerable
from screenpy_selenium.abilities import BrowseTheWeb
from selenium.webdriver.common.by import By

class SongUploadConfirmation(Answerable):
    """Question to verify if the upload success message appears."""

    SUCCESS_MESSAGE = (By.CLASS_NAME, "upload-success")

    def answered_by(self, actor):
        browser = actor.ability_to(BrowseTheWeb)
        elements = browser.browser.find_elements(*self.SUCCESS_MESSAGE)
        return len(elements) > 0

    def __str__(self):
        return "whether the upload success message is visible"
