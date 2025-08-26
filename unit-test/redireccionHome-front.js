// Simulación de NavComponent
const NavComponent = {
  isHomePage: false,

  // Método que simula la suscripción a eventos del router
  onNavigation(event) {
    if (event.urlAfterRedirects === '/home') {
      this.isHomePage = true;
    } else {
      this.isHomePage = false;
    }
  }
};

// Simulación de eventos de navegación
function simulateNavigation(url) {
  const navigationEndEvent = {
    urlAfterRedirects: url
  };
  NavComponent.onNavigation(navigationEndEvent);
}

// Pruebas simuladas
console.log('Test 1: navegación a /home');
simulateNavigation('/home');
console.assert(NavComponent.isHomePage === true, 'isHomePage debería ser true');
console.log('Resultado:', NavComponent.isHomePage);

console.log('\nTest 2: navegación a /other-page');
simulateNavigation('/other-page');
console.assert(NavComponent.isHomePage === false, 'isHomePage debería ser false');
console.log('Resultado:', NavComponent.isHomePage);
