import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import { apiLogin, apiSignUp } from '../tasks/login';

Given('que el usuario tiene credenciales válidas', function () {
    const email = 'Angel@Angel.com';
    const password = 'Angel';
    const username = 'Angel';
    (this as any).credentials = { username, password, email };
});

When('el usuario intenta iniciar sesión', async function () {
    const w: any = this as any;
    const creds = w.credentials;
    // Login endpoint expects email + password
    const res = await apiLogin(creds.email, creds.password);
    w.lastResponse = res;
    if (res && res.status < 400 && res.body && res.body.user) {
        w.user = res.body.user;
    }
});

Then('el usuario debería ver un mensaje de éxito', function () {
    const res = (this as any).lastResponse;
    assert.ok(res, 'Expected response to exist');
    assert.ok([200, 201].includes(res.status), `Unexpected status ${res.status}`);
    assert.ok(res.body.token || res.body.user, 'Expected token or user in response body');
});
