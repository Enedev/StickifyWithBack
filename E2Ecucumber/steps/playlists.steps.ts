import { When } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { CreatePlaylist } from '../tasks/createPlaylist';

When('crea una playlist con título {string}', async function (this: CustomWorld, title: string) {
  await this.actor.attemptsTo(new CreatePlaylist({ title }));
});
