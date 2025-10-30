import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import { rateSong, getRatingsByUser } from '../tasks/rateSong';

When('el usuario califica la canción {string} con {int}', async function (trackIdStr: string, calificacion: number) {
    const w: any = this as any;
    const userId = w.credentials?.username || w.credentials?.email || 'test-runner';
    const trackId = parseInt(trackIdStr, 10);
    const res = await rateSong(userId, trackId, calificacion);
    w.lastResponse = res;
});

Then('la calificación debería ser guardada', async function () {
    const w: any = this as any;
    const res = w.lastResponse;
    assert.ok(res, 'Expected response to exist');
    assert.ok([200, 201].includes(res.status), `Unexpected status ${res.status}`);
});
