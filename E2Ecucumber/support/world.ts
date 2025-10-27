import { setWorldConstructor } from '@cucumber/cucumber';
import { Actor } from './actor';
import { InteractWithApi } from '../abilities/InteractWithApi';

class CustomWorld {
  actor: Actor;
  baseUrl: string;

  constructor() {
    let base = process.env.BASE_URL || 'http://localhost:3000';
    // Ensure we target the API prefix used by Nest (main.ts sets global prefix 'api')
    if (!base.endsWith('/api')) {
      // avoid duplicate slashes
      base = base.replace(/\/$/, '') + '/api';
    }
    this.baseUrl = base;
    this.actor = new Actor('Tester')
      .whoCan('InteractWithApi', new InteractWithApi(this.baseUrl));
  }
}

setWorldConstructor(CustomWorld as any);

export { CustomWorld };
