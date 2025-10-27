Feature: Follow users
  Como usuario
  Quiero seguir a otro usuario
  Para ver su contenido

  Scenario: Seguir a un usuario
    Given que el usuario está autenticado
  When intenta seguir al usuario
    Then la respuesta debería tener código 201 o 200
