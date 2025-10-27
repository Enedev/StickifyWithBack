import { Actor } from '../support/actor';
import { InteractWithApi } from '../abilities/InteractWithApi';
import { v4 as uuidv4 } from 'uuid';

export class SignUp {
  username: string;
  password: string;
  email: string;

  constructor(username?: string, password?: string, email?: string) {
    this.username = username || `user_${uuidv4().slice(0,8)}`;
    this.password = password || '1234';
    this.email = email || `${this.username}@example.com`;
  }

  async performAs(actor: Actor) {
    const api = actor.abilityTo<InteractWithApi>('InteractWithApi');
    if (!api) throw new Error('Missing InteractWithApi ability');

    const createRes = await api.post('/users', {
      username: this.username,
      password: this.password,
      email: this.email
    });

    console.log('SignUp create response:', createRes);

    // After creation, retrieve user by email to get id
    const userRes = await api.get(`/users/by-email/${encodeURIComponent(this.email)}`);
    // store created user on actor for later tasks
    actor.lastResponse = userRes;
    try {
      const user = userRes && userRes.body;
      if (user) {
        (actor as any).user = user;
      }
      // If create call returned a token, set it on the actor and ability
      const token = createRes && createRes.body && createRes.body.token;
      if (token) {
        (actor as any).token = token;
        try {
          const ability: any = actor.abilityTo('InteractWithApi');
          if (ability && typeof ability.setAuth === 'function') ability.setAuth(token);
        } catch (e) {}
      }
    } catch (e) {
      // ignore
    }
    return userRes;
  }
}
