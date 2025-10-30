import { Given, Then } from '@cucumber/cucumber';
import assert from 'assert';
import { apiLogin, apiSignUp } from '../tasks/login';

Given('que el usuario está autenticado', { timeout: 35000 }, async function () {
    // If test provides credentials in the world use them, otherwise create defaults
    const w: any = this as any;
    if (!w.credentials) {
        const username = `user_${Date.now()}`;
        const password = 'P@ssw0rd!';
        const email = `${username}@example.test`;
        w.credentials = { username, password, email };
    }

    // Try login, if fails create user and login again
    // Login uses email + password on the backend
    let res = await apiLogin(w.credentials.email, w.credentials.password);
    let signUpRes: any;
    if (!res || res.status >= 400) {
        signUpRes = await apiSignUp(w.credentials.username, w.credentials.email, w.credentials.password);
        // Try login again - if it still fails, fall back to the token returned by sign-up
        res = await apiLogin(w.credentials.email, w.credentials.password);
    }

    w.lastResponse = res || signUpRes;
    // Prefer token from successful login, otherwise use sign-up token
    w.token = res?.body?.token || signUpRes?.body?.token;
    w.user = res?.body?.user || signUpRes?.body?.user;
    assert.ok(w.token || w.user, 'Expected token or user to exist');
});

Then('la respuesta debería tener código {int} o {int}', function (code1: number, code2: number) {
    const w: any = this as any;
    const res = w.lastResponse;
    assert.ok(res, 'Expected response to exist');
    assert.ok([code1, code2].includes(res.status), `Unexpected status ${res.status}`);
});

Then('la calificación debería ser guardada', function () {
    const w: any = this as any;
    const res = w.lastResponse;
    assert.ok(res, 'Expected response to exist');
    assert.ok([200, 201].includes(res.status), `Unexpected status ${res.status}`);
});