import { BeforeAll, AfterAll } from '@cucumber/cucumber';

BeforeAll(async function() {
  // Aquí puedes arrancar servicios, preparar DB, etc.
  // Ejemplo: iniciar el backend si quieres tests integrados.
});

AfterAll(async function() {
  // Teardown global
});
