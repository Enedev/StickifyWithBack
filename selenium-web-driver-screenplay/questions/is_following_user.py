from screenpy.protocols import Answerable
from screenpy_selenium.abilities import BrowseTheWeb
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By


class IsFollowingUser(Answerable):

    def __init__(self, username: str):
        self.username = username

    def answered_by(self, actor):
        browser = actor.ability_to(BrowseTheWeb)

        try:

            user_cards = browser.browser.find_elements(By.CLASS_NAME, "user-card")

            for card in user_cards:
                name_element = card.find_element(By.CLASS_NAME, "user-name")
                if self.username.lower() in name_element.text.lower():
                    follow_button = card.find_element(By.CLASS_NAME, "follow-btn")
                    button_text = follow_button.text.strip().lower()
                    return button_text in ["siguiendo", "following"]

            return False

        except NoSuchElementException:
            return False

    def __str__(self):
        return f"whether the actor is following the user '{self.username}'"
