from screenpy import beat
from screenpy_selenium.abilities import BrowseTheWeb

class ScrollToElement:

    def __init__(self, target):
        self.target = target

    @beat("{} scrolls to {target}")
    def perform_as(self, the_actor):
        browser = the_actor.ability_to(BrowseTheWeb).browser
        element = self.target.found_by(the_actor)
        browser.execute_script(
            "arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });",
            element
        )
        return self

    def __repr__(self):
        return f"ScrollToElement({self.target})"