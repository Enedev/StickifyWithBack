import { When } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { FollowUser } from '../tasks/followUser';
import { SignUp } from '../tasks/signUp';


When('intenta seguir al usuario', async function (this: CustomWorld) {
  console.log('Ejecutando step: intenta seguir al usuario');
  // Crear usuario objetivo con username y email únicos
  const targetUsername = `user_${Date.now()}`;
  const targetEmail = `${targetUsername}@test.com`;
  const targetPassword = '1234';

  // Registrar usuario objetivo
  await this.actor.attemptsTo(new SignUp(targetUsername, targetPassword, targetEmail));
  const created = this.actor.lastResponse;
  console.log('Respuesta de creación de usuario objetivo:', created);
  // El backend debe devolver el usuario con su UUID
  const targetUser = created && created.body && (created.body.user || created.body);
  if (!targetUser || !targetUser.id) {
    throw new Error('No se pudo crear usuario objetivo');
  }

  // Seguir al usuario usando su UUID y email
  await this.actor.attemptsTo(new FollowUser(targetUser.email));
});
