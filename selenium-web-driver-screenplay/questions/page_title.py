from screenpy.protocols import Answerable
from screenpy_selenium.abilities import BrowseTheWeb
from screenpy import Actor

class PageTitle(Answerable):

    def answered_by(self, actor: Actor) -> str:
        return actor.ability_to(BrowseTheWeb).browser.title
