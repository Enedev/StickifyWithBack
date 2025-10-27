import { Actor } from '../support/actor';
import { InteractWithApi } from '../abilities/InteractWithApi';

export class Login {
  credentials: any;
  constructor(credentials: any) {
    this.credentials = credentials;
  }

  async performAs(actor: Actor) {
    const api = actor.abilityTo<InteractWithApi>('InteractWithApi');
    if (!api) throw new Error('Actor does not have InteractWithApi ability');
    // Backend expects an email field for login. Accept username in credentials and map to email if needed.
    const payload: any = { password: this.credentials.password };
    const credsAny = this.credentials as any;
    if (credsAny.email) payload.email = credsAny.email;
    else if (credsAny.username) {
      // if username doesn't look like an email, append default domain used by SignUp
      if (credsAny.username.includes('@')) payload.email = credsAny.username;
      else payload.email = `${credsAny.username}@example.com`;
    } else throw new Error('No email/username provided for login');

  const res = await api.post('/auth/login', payload);
  console.log('Login response:', res);
  actor.lastResponse = res;
    try {
      const body = res && res.body;
      if (body && body.token) {
        (actor as any).token = body.token;
        // set auth header on ability immediately so subsequent calls in same test are authenticated
        try {
          const ability: any = actor.abilityTo('InteractWithApi');
          if (ability && typeof ability.setAuth === 'function') ability.setAuth(body.token);
        } catch (e) {}
      }
      if (body && body.user) {
        (actor as any).user = body.user;
      }
    } catch (e) {
      // ignore
    }
    return res;
  }
}
