from screenpy.protocols import Answerable
from screenpy_selenium.abilities import BrowseTheWeb

class PlaylistCount(Answerable):

    def __init__(self, locator: tuple):
        self.locator = locator  # locator que selecciona todas las playlists

    def answered_by(self, actor):
        browser = actor.ability_to(BrowseTheWeb)
        elements = browser.browser.find_elements(*self.locator)
        return len(elements)

    def __str__(self):
        return "the number of playlists displayed"
