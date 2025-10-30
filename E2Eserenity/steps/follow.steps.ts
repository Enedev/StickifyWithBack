import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import { followUser } from '../tasks/followUser';
import { getUserByEmail } from '../tasks/getUserByEmail';
import { apiSignUp } from '../tasks/login';

When('el usuario sigue a {string}', async function (targetEmail: string) {
    const w: any = this as any;
    // Asegurarse de que el usuario objetivo exista
    let targetUser = await getUserByEmail(targetEmail);
    if (!targetUser || targetUser.status >= 400) {
        // Si el usuario no existe, crearlo
        const username = `user_${Date.now()}`;
        await apiSignUp(username, targetEmail, 'P@ssw0rd!');
        targetUser = await getUserByEmail(targetEmail);
    }

    // resolve follower id: prefer explicit user id, otherwise look it up by email
    let followerId = w.user?.id;
    if (!followerId) {
        const possible = w.credentials?.email || w.credentials?.username;
        if (possible && possible.includes('@')) {
            const lookup = await getUserByEmail(possible);
            if (lookup && lookup.status < 400 && lookup.body && lookup.body.id) {
                followerId = lookup.body.id;
            }
        }
    }
    if (!followerId) {
        throw new Error('No se pudo determinar el ID del usuario seguidor');
    }
    const res = await followUser(followerId, targetEmail, true);
    w.lastResponse = res;
});

Then('el usuario debería ver un mensaje de éxito al seguir', function () {
    const res = (this as any).lastResponse;
    assert.ok(res, 'Expected response to exist');
    assert.ok([200, 201].includes(res.status), `Unexpected status ${res.status}`);
});
