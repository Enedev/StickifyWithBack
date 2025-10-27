import { Actor } from '../support/actor';
import { InteractWithApi } from '../abilities/InteractWithApi';

export class RateSong {
  constructor(private songId: string, private rating: number) {}

  async performAs(actor: Actor) {
    const api = actor.abilityTo<InteractWithApi>('InteractWithApi');
    if (!api) throw new Error('Missing InteractWithApi ability');

    const actorUser = (actor as any).user || (actor.lastResponse && actor.lastResponse.body && actor.lastResponse.body.user);
    let userId = actorUser && (actorUser.id || actorUser._id);
    if (!userId && actorUser && actorUser.email) {
      const lookup = await api.get(`/users/by-email/${encodeURIComponent(actorUser.email)}`);
      userId = lookup && lookup.body && lookup.body.id;
      if (userId) (actor as any).user = lookup.body;
    }
    if (!userId) throw new Error('Authenticated actor id not available');

    const res = await api.post('/ratings', {
      userId,
      trackId: Number(this.songId),
      rating: this.rating
    });
    console.log('RateSong response:', res);
    actor.lastResponse = res;
    return res;
  }
}
