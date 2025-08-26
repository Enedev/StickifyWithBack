// Mock de localStorage
const mockLocalStorage = {
  store: {},
  setItem(key, value) {
    this.store[key] = value;
    console.log(`localStorage.setItem('${key}', '${value}')`);
  },
  getItem(key) {
    console.log(`localStorage.getItem('${key}')`);
    return this.store[key] || null;
  },
  removeItem(key) {
    delete this.store[key];
    console.log(`localStorage.removeItem('${key}')`);
  },
  reset() {
    this.store = {};
  }
};

// Mock de Router
const mockRouter = {
  navigate(path) {
    console.log(`Router.navigate(${JSON.stringify(path)})`);
    mockRouter.lastNavigation = path;
  },
  lastNavigation: null
};

// Mock de Swal
const mockSwal = {
  async fire({ icon, title, text, confirmButtonText }) {
    console.log(`Swal.fire → icon: ${icon}, title: ${title}, text: ${text}, confirmButtonText: ${confirmButtonText}`);
    return { isConfirmed: true };
  }
};

// Simulación de AuthService
const AuthService = {
  currentUser: null,

  async logOut() {
    this.currentUser = null;
    mockLocalStorage.removeItem('currentUser');
    mockLocalStorage.removeItem('authToken');
    mockRouter.navigate(['/log-in']);
    await mockSwal.fire({
      icon: 'info',
      title: 'Sesión cerrada',
      text: 'Has cerrado sesión correctamente.',
      confirmButtonText: 'Aceptar'
    });
  }
};

// Prueba simulada
(async () => {
  console.log('Test: logOut debe limpiar sesión y redirigir');

  // Estado inicial
  AuthService.currentUser = { name: 'testUser' };
  mockLocalStorage.setItem('currentUser', JSON.stringify(AuthService.currentUser));
  mockLocalStorage.setItem('authToken', 'abc123');

  // Ejecutar logOut
  await AuthService.logOut();

  // Validaciones
  console.assert(AuthService.currentUser === null, 'currentUser debería ser null');
  console.assert(mockLocalStorage.getItem('currentUser') === null, ' currentUser debería haber sido eliminado del localStorage');
  console.assert(mockLocalStorage.getItem('authToken') === null, ' authToken debería haber sido eliminado del localStorage');
  console.assert(JSON.stringify(mockRouter.lastNavigation) === JSON.stringify(['/log-in']), 'Debe navegar a /log-in');

  console.log('Test completado correctamente');
})();
