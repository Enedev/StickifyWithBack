Feature: Calificar canción
  Como usuario
  Quiero calificar una canción
  Para expresar mi opinión

  Scenario: Calificar una canción
    Given que el usuario está autenticado
    When califica la canción con id "123" con 5 estrellas
    Then la respuesta debería tener código 201 o 200
