import { Actor } from '../support/actor';
import { InteractWithApi } from '../abilities/InteractWithApi';

export class FollowUser {
  constructor(private targetEmail: string) {}

  async performAs(actor: Actor) {
    const api = actor.abilityTo<InteractWithApi>('InteractWithApi');
    if (!api) throw new Error('Missing InteractWithApi ability');

    // Get current user info
    const actorUser = (actor as any).user;
    if (!actorUser || !actorUser.id) {
      throw new Error('Actor must be authenticated');
    }

    // Follow the target user directly using email
    const res = await api.put(`/users/${actorUser.id}/follow`, { 
      targetEmail: this.targetEmail,
      follow: true 
    });
    
    actor.lastResponse = res;
    return res;
  }
}
