from screenpy.protocols import Answerable
from screenpy_selenium.abilities import BrowseTheWeb
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By


class IsFollowingUser(Answerable):
    """Question to verify if the actor is currently following a specific user."""

    def __init__(self, username: str):
        """username: The name of the user to verify."""
        self.username = username

    def answered_by(self, actor):
        browser = actor.ability_to(BrowseTheWeb)

        try:
            # Ejemplo: el botón de "Seguir" cambia de texto a "Siguiendo"
            # y tiene un atributo data-username o un texto identificador
            user_cards = browser.browser.find_elements(By.CLASS_NAME, "user-card")

            for card in user_cards:
                name_element = card.find_element(By.CLASS_NAME, "user-name")
                if self.username.lower() in name_element.text.lower():
                    follow_button = card.find_element(By.CLASS_NAME, "follow-btn")
                    button_text = follow_button.text.strip().lower()
                    # Se asume que el botón dice "Siguiendo" cuando ya sigue
                    return button_text in ["siguiendo", "following"]

            return False

        except NoSuchElementException:
            return False

    def __str__(self):
        return f"whether the actor is following the user '{self.username}'"
