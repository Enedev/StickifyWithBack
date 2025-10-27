import { When } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { RateSong } from '../tasks/rateSong';


When('califica la canción con id {string} con {int} estrellas', async function (this: CustomWorld, id: string, rating: number) {
  // Obtener una canción existente o crear una nueva con el DTO esperado por el backend
  const api = this.actor.abilityTo('InteractWithApi') as any;
  const listRes = await api.get('/songs');
  let trackId: number | undefined;
  if (listRes && listRes.body && Array.isArray(listRes.body) && listRes.body.length > 0) {
    const first = listRes.body[0];
    trackId = first.trackId || first.id || first.track_id || first.trackID;
  }

  if (!trackId) {
    const newTrackId = Math.floor(Math.random() * 1000000);
    const createRes = await api.post('/songs', {
      trackId: newTrackId,
      artistName: 'Test Artist',
      trackName: `song_${Date.now()}`,
      primaryGenreName: 'Test',
      collectionName: 'Test Album',
      artworkUrl100: 'http://example.com/art.jpg',
      releaseDate: new Date().toISOString(),
      isUserUpload: true,
      collectionId: 0,
      artistId: 0
    });
    trackId = createRes && createRes.body && (createRes.body.trackId || createRes.body.id || createRes.body.trackId);
  }

  if (!trackId) throw new Error('No se pudo obtener ni crear la canción');

  await this.actor.attemptsTo(new RateSong(String(trackId), rating));
});
