Feature: Autenticación
  Como usuario
  Quiero iniciar sesión
  Para acceder a funciones protegidas

  Scenario: Inicio de sesión con credenciales válidas
    Given que el usuario tiene credenciales válidas
    When el usuario intenta iniciar sesión
    Then el usuario debería ver un mensaje de éxito
