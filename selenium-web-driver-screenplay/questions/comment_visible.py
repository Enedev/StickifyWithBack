from screenpy.protocols import Answerable
from screenpy_selenium.abilities import BrowseTheWeb
from selenium.webdriver.common.by import By

class CommentVisible(Answerable):

    def __init__(self, comment_text: str):
        self.comment_text = comment_text

    def answered_by(self, actor):
        browser = actor.ability_to(BrowseTheWeb)
        comments = browser.browser.find_elements(By.CLASS_NAME, "comment-text")
        return any(self.comment_text in comment.text for comment in comments)

    def __str__(self):
        return f"whether the comment '{self.comment_text}' is visible"
