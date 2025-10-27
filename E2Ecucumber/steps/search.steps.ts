import { When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { CustomWorld } from '../support/world';
import { SearchSongs } from '../tasks/searchSongs';


When('busca por {string}', async function (this: CustomWorld, query: string) {
  // Crear una canción para asegurar que la búsqueda tenga resultados
  const api = this.actor.abilityTo('InteractWithApi') as any;
  const songTitle = `searchable_${query}_${Date.now()}`;
  // Use DTO fields expected by backend
  await api.post('/songs', {
    trackId: Math.floor(Math.random() * 1000000),
    artistName: 'Test Artist',
    trackName: songTitle,
    primaryGenreName: query,
    collectionName: 'Test Album',
    artworkUrl100: 'http://example.com/art.jpg',
    releaseDate: new Date().toISOString(),
    isUserUpload: true,
    collectionId: 0,
    artistId: 0
  });
  await this.actor.attemptsTo(new SearchSongs(query));
});

Then('la respuesta debería contener una lista de canciones', function (this: CustomWorld) {
  const res = this.actor.lastResponse;
  expect(res).to.have.property('statusCode');
  expect(res.statusCode).to.equal(200);
  expect(res.body).to.be.an('array');
});
