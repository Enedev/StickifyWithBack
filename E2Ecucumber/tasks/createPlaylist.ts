import { Actor } from '../support/actor';
import { InteractWithApi } from '../abilities/InteractWithApi';
import { v4 as uuidv4 } from 'uuid';

export class CreatePlaylist {
  constructor(private payload: { title: string; description?: string }) {}

  async performAs(actor: Actor) {
    const api = actor.abilityTo<InteractWithApi>('InteractWithApi');
    if (!api) throw new Error('Missing InteractWithApi ability');

  const actorUser = (actor as any).user || (actor.lastResponse && actor.lastResponse.body && actor.lastResponse.body.user);
  const createdBy = actorUser && (actorUser.id || actorUser._id) || undefined;

    const dto = {
      id: uuidv4(),
      name: this.payload.title,
      trackIds: [],
      cover: undefined,
      type: 'user',
      createdBy: createdBy,
      createdAt: new Date().toISOString()
    };

    const res = await api.post('/playlists', dto);
    console.log('CreatePlaylist response:', res);
    // Save playlist ID for later use
    if (res && res.body && res.body.id) {
      (actor as any).playlistId = res.body.id;
    }
    actor.lastResponse = res;
    return res;
  }
}
