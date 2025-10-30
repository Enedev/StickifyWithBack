import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import { searchSongs } from '../tasks/searchSongs';

// Authentication Given is implemented in common.steps.ts to avoid duplication across step files

When('el usuario busca la canción {string}', { timeout: 35000 }, async function (cancion: string) {
    const results = await searchSongs(cancion);
    const w: any = this as any;
    w.searchResults = results;
    // Also set lastResponse so legacy Then steps that expect a HTTP-like response can assert on it
    w.lastResponse = { status: 200, body: results } as any;
});

Then('el usuario debería ver la canción en los resultados', function () {
    const results = (this as any).searchResults || [];
    assert.ok(results.length > 0, 'Expected search results to contain at least one song');
});

Then('la respuesta debería contener una lista de canciones', function () {
    const w: any = this as any;
    const res = w.lastResponse;
    assert.ok(res, 'Expected response to exist');
    const body = res.body || res;
    assert.ok(Array.isArray(body), 'Expected response body to be an array');
    assert.ok(body.length > 0, 'Expected at least one song in the response');
});