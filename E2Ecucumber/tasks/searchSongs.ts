import { Actor } from '../support/actor';
import { InteractWithApi } from '../abilities/InteractWithApi';

export class SearchSongs {
  constructor(private query: string) {}

  async performAs(actor: Actor) {
    const api = actor.abilityTo<InteractWithApi>('InteractWithApi');
    if (!api) throw new Error('Missing InteractWithApi ability');
    const res = await api.get(`/songs?search=${encodeURIComponent(this.query)}`);
    actor.lastResponse = res;
    return res;
  }
}
