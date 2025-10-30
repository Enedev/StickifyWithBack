from screenpy import Actor
from screenpy.pacing import beat
from screenpy_selenium.actions import Click
from selenium.webdriver.common.by import By


class ClickElement:

    def __init__(self, target: tuple):
        self.target = target

    @beat("{} hace clic en el elemento indicado.")
    def perform_as(self, actor: Actor) -> None:
        actor.attempts_to(Click.on(self.target))
