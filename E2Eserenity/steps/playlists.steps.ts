import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import { createPlaylist, findPlaylistByName } from '../tasks/createPlaylist';

When('el usuario crea una lista de reproducción llamada {string}', async function (nombre: string) {
    const w: any = this as any;
    const created = await createPlaylist(nombre, w.credentials?.username || 'test-runner');
    w.lastResponse = created;
});

Then('la lista de reproducción debería aparecer en la lista del usuario', async function () {
    const w: any = this as any;
    const created = w.lastResponse;
    assert.ok(created, 'Expected created response to exist');
    assert.ok([200, 201].includes(created.status), `Unexpected status ${created.status}`);
    // try to find by name
    const name = created?.body?.name || (created?.request && created.request._data && created.request._data.name);
    if (name) {
        const found = await findPlaylistByName(name);
        assert.ok(found, 'Expected found response to exist');
        assert.ok([200, 201].includes(found.status), `Unexpected status ${found.status}`);
        assert.ok(found.body, 'Expected found.body to exist');
    }
});
