Feature: Calificar canción
  Como usuario
  Quiero calificar una canción
  Para expresar mi opinión

  Scenario: Calificar una canción
    Given que el usuario está autenticado
    When el usuario califica la canción "123" con 5
    Then la respuesta debería tener código 201 o 200

