const Swal = {
  fire: ({ icon, text }) => {
    console.log(`Swal: icon=${icon}, text=${text || ''}`);
    return Promise.resolve({ isConfirmed: true });
  }
};

const mockRouter = {
  navigate: (path) => {
    console.log('Navigating to:', path);
  }
};

const mockAuthService = {
  signUp: async (data) => {
    if (data.email === 'test@example.com' && data.username === 'testuser') {
      return true;
    }
    throw {
      status: 400,
      error: { code: '23505', detail: 'duplicate key value' }
    };
  }
};

const SignUpComponent = {
  registryForm: {
    username: '',
    email: '',
    password: '',
    repeatPassword: '',
    isValid() {
      return (
        this.username &&
        this.email &&
        this.password &&
        this.repeatPassword &&
        this.password === this.repeatPassword
      );
    },
    setValue({ username, email, password, repeatPassword }) {
      this.username = username;
      this.email = email;
      this.password = password;
      this.repeatPassword = repeatPassword;
    }
  },
  isPremium: false,

  async onRegistry() {
    if (!this.registryForm.isValid()) {
      await Swal.fire({ icon: 'error', text: 'Formulario inválido' });
      return;
    }

    try {
      const result = await mockAuthService.signUp({
        username: this.registryForm.username,
        email: this.registryForm.email,
        password: this.registryForm.password,
        premium: this.isPremium
      });

      if (result) {
        await Swal.fire({ icon: 'success', text: 'Registro exitoso' });
        mockRouter.navigate(['/log-in']);
      }
    } catch (error) {
      if (error.error?.code === '23505') {
        await Swal.fire({ icon: 'error', text: 'Este correo electrónico ya está registrado.' });
      } else {
        await Swal.fire({ icon: 'error', text: 'Error inesperado' });
      }
    }
  }
};

(async () => {
  console.log('Test 1: componente creado');
  console.assert(SignUpComponent !== undefined, 'Componente no creado');

  console.log('\nTest 2: formulario inválido');
  SignUpComponent.registryForm.setValue({
    username: '',
    email: '',
    password: '',
    repeatPassword: ''
  });
  await SignUpComponent.onRegistry();

  console.log('\nTest 3: registro exitoso');
  SignUpComponent.registryForm.setValue({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    repeatPassword: 'password123'
  });
  SignUpComponent.isPremium = true;
  await SignUpComponent.onRegistry();

  console.log('\nTest 4: usuario ya existe');
  SignUpComponent.registryForm.setValue({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    repeatPassword: 'password123'
  });
  mockAuthService.signUp = async () => {
    throw {
      status: 400,
      error: { code: '23505', detail: 'duplicate key value' }
    };
  };
  await SignUpComponent.onRegistry();
})();
