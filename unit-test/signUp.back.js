const bcrypt = {
  hashSync: (plain) => `hashed-${plain}`,
  compareSync: (plain, hashed) => hashed === `hashed-${plain}`
};

class NotFoundException extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundException';
  }
}

const mockUser = {
  id: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
  email: 'test@example.com',
  password: bcrypt.hashSync('password123'),
  username: 'TestUser',
  premium: false,
  followers: [],
  following: [],
};

const mockUserRepository = {
  findOneBy: async ({ email }) => {
    return email === mockUser.email ? mockUser : null;
  }
};

const mockUserService = {
  getToken: () => 'mocked-jwt-token'
};

const AuthService = {
  async login({ email, password }) {
    const user = await mockUserRepository.findOneBy({ email });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new NotFoundException('Invalid credentials');
    }

    const token = mockUserService.getToken();
    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        premium: user.premium,
        followers: user.followers,
        following: user.following,
      }
    };
  }
};

(async () => {
  console.log('Test 1: Usuario creado exitosamente');
  const result = await AuthService.login({
    email: 'test@example.com',
    password: 'password123'
  });
})();
