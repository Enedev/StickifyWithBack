import { Given, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { Login } from '../tasks/login';
import { SignUp } from '../tasks/signUp';
import { expect } from 'chai';


Given('que el usuario está autenticado', async function (this: CustomWorld) {
  console.log('Ejecutando step: que el usuario está autenticado');
  const user = process.env.E2E_USER || process.env.BASE_USER || `test`;
  const pass = process.env.E2E_PASS || process.env.BASE_PASS || '1234';

  // Intentar login primero
  await this.actor.attemptsTo(new Login({ username: user, password: pass }));
  let res = this.actor.lastResponse;

  // Si login falla (no token / not success), crear usuario y volver a loguear
  const token = res && res.body && (res.body.token || (res.body.user && res.body.user.token));
  if (!token) {
    // crear usuario
    await this.actor.attemptsTo(new SignUp(user, pass));
    // intentar login otra vez
    await this.actor.attemptsTo(new Login({ username: user, password: pass }));
    res = this.actor.lastResponse;
  }

  // setear token si está disponible
  const finalToken = res && res.body && (res.body.token || (res.body.user && res.body.user.token));
  try {
    const api: any = this.actor.abilityTo('InteractWithApi');
    if (finalToken && api && typeof api.setAuth === 'function') api.setAuth(finalToken);
  } catch (e) {
    // ignore
  }
  // Guardar usuario autenticado en actor si está en la respuesta
  const body = res && res.body;
  if (body && body.user) {
    (this.actor as any).user = body.user;
    (this.actor as any).lastResponse = res; // ensure lastResponse remains
  }
  // If we have a token but no user object, try to look up the user by email (common patterns)
  if ((!((this.actor as any).user)) && finalToken) {
    try {
      const api: any = this.actor.abilityTo('InteractWithApi');
      // Try common email variants based on username
      const candidateUser = user;
      const variants = [candidateUser, `${candidateUser}@example.com`, `${candidateUser}@test.com`].filter(Boolean);
      for (const v of variants) {
        const email = v.includes('@') ? v : `${v}@example.com`;
        const lookup = await api.get(`/users/by-email/${encodeURIComponent(email)}`);
        if (lookup && lookup.body && (lookup.body.id || lookup.body.user)) {
          const u = lookup.body.user || lookup.body;
          (this.actor as any).user = u;
          break;
        }
      }
    } catch (e) {
      // ignore lookup failures
    }
  }
  console.log('Usuario autenticado:', (this.actor as any).user);
});

Then('la respuesta debería tener código 201 o 200', function (this: CustomWorld) {
  const res = this.actor.lastResponse;
  expect(res).to.have.property('statusCode');
  expect([200, 201]).to.include(res.statusCode);
});
