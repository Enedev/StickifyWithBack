import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { CustomWorld } from '../support/world';
import { Login } from '../tasks/login';
import { SignUp } from '../tasks/signUp';

Given('que el usuario tiene credenciales válidas', function (this: CustomWorld) {
  const username = `user_${Date.now()}`;
  const password = '1234';
  const email = `${username}@test.com`;
  (this as any).credentials = { username, password, email };
});

When('el usuario intenta iniciar sesión', async function (this: CustomWorld) {
  const creds = (this as any).credentials;
  await this.actor.attemptsTo(new Login({ username: creds.username, password: creds.password, email: creds.email }));
  let res = this.actor.lastResponse;
  const token = res && res.body && (res.body.token || (res.body.user && res.body.user.token));
  if (!token) {
    // crear usuario y volver a loguear
    await this.actor.attemptsTo(new SignUp(creds.username, creds.password, creds.email));
    await this.actor.attemptsTo(new Login({ username: creds.username, password: creds.password, email: creds.email }));
  }
});

Then('el usuario debería ver un mensaje de éxito', function (this: CustomWorld) {
  const res = this.actor.lastResponse;
  expect(res).to.have.property('body');
  const body = res.body || {};
  const hasToken = !!body.token;
  const hasUser = !!body.user;
  expect(hasToken || hasUser, 'Response should contain either token or user object').to.be.true;
});
