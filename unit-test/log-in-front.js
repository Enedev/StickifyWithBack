const mockAuthService = {
  logIn: ({ email, password }) => {
    if (email === 'test@example.com' && password === 'password123') {
      return Promise.resolve(true);
    } else {
      return Promise.reject({ message: 'Login failed' });
    }
  }
};

const mockRouter = {
  navigate: (path) => {
    console.log('Navigating to:', path);
  }
};

const mockSwal = {
  fire: ({ icon, text }) => {
    console.log(`Swal: icon=${icon}, text=${text || ''}`);
    return Promise.resolve({ isConfirmed: true });
  }
};

const LogInComponent = {
  loginForm: {
    email: '',
    password: '',
    isValid() {
      return this.email && this.password;
    }
  },

  async onLogin() {
    if (!this.loginForm.isValid()) {
      await mockSwal.fire({ icon: 'error', text: 'Formulario inválido' });
      return;
    }

    try {
      const result = await mockAuthService.logIn({
        email: this.loginForm.email,
        password: this.loginForm.password
      });

      if (result) {
        await mockSwal.fire({ icon: 'success', text: 'Login exitoso' });
        mockRouter.navigate(['/home']);
      }
    } catch (error) {
      await mockSwal.fire({ icon: 'error', text: error.message });
    }
  }
};

(async () => {
  console.log('Test 1: componente creado');
  console.assert(LogInComponent !== undefined, 'Componente no creado');

  console.log('\nTest 2: login con formulario inválido');
  LogInComponent.loginForm.email = '';
  LogInComponent.loginForm.password = '';
  await LogInComponent.onLogin();

  console.log('\nTest 3: login exitoso con credenciales válidas');
  LogInComponent.loginForm.email = 'test@example.com';
  LogInComponent.loginForm.password = 'password123';
  await LogInComponent.onLogin();

  console.log('\nTest 4: login fallido con credenciales inválidas');
  LogInComponent.loginForm.email = 'wrong@example.com';
  LogInComponent.loginForm.password = 'wrongpass';
  await LogInComponent.onLogin();
})();
