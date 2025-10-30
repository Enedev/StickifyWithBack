Feature: Follow users
  Como usuario
  Quiero seguir a otro usuario
  Para ver su contenido

  Scenario: Seguir a un usuario
    Given que el usuario está autenticado
    When el usuario sigue a "bighead@bighead"
    Then el usuario debería ver un mensaje de éxito al seguir

