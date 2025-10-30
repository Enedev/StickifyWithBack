from screenpy import Page
print(Page)
from screenpy.knowledge import Answer
from selenium.webdriver.common.by import By
from screenpy_selenium.actions import Open


class PageObject(Page):
    # Puedes agregar elementos comunes de la página o acciones adicionales
    def __init__(self, browser):
        super().__init__(browser)

    # Acción para visitar una URL
    def visit(self, url: str):
        """Método para visitar una URL con el navegador."""
        return self.attempts_to(Open.browser_on(url))

    # Verificaciones que pueden ser reutilizadas en varias páginas
    def title_is(self, expected_title: str) -> Answer:
        """Verifica si el título de la página es el esperado."""
        return Answer.the(self.browser.title).should.equal(expected_title)

    def url_is(self, expected_url: str) -> Answer:
        """Verifica si la URL de la página es la esperada."""
        return Answer.the(self.browser.current_url).should.equal(expected_url)
