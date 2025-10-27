import pytest
from screenpy import Actor
from screenpy_selenium.abilities import BrowseTheWeb
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

from pathlib import Path
from datetime import datetime


@pytest.fixture
def actor(request):
    """Provee un actor con capacidad de navegar con Selenium."""
    options = Options()
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--headless=new")  # Comenta esta línea si deseas ver el navegador
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")

    driver = webdriver.Chrome(service=Service(), options=options)
    test_actor = Actor.named("User").who_can(BrowseTheWeb.using(driver))

    yield test_actor

    driver.quit()


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    from screenpy_selenium.abilities import BrowseTheWeb

    outcome = yield
    rep = outcome.get_result()

    if rep.when == "call" and "actor" in item.funcargs:
        actor = item.funcargs["actor"]
        try:
            screenshot_dir = Path("screenshots")
            screenshot_dir.mkdir(exist_ok=True)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            status = "PASSED" if rep.passed else "FAILED"
            screenshot_path = screenshot_dir / f"{item.name}_{status}_{timestamp}.png"

            browser = actor.ability_to(BrowseTheWeb).browser
            browser.save_screenshot(str(screenshot_path))

            # Agregar imagen al reporte HTML si pytest-html está presente
            pytest_html = item.config.pluginmanager.get_plugin("html")
            if pytest_html:
                extra = getattr(rep, "extras", [])
                extra.append(pytest_html.extras.image(str(screenshot_path)))
                rep.extras = extra

        except Exception as e:
            print(f"Error al capturar la pantalla: {e}")
