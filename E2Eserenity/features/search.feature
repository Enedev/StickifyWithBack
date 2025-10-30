Feature: Buscar canciones
  Como usuario
  Quiero buscar canciones
  Para encontrar música por texto

  Scenario: Buscar por texto
    Given que el usuario está autenticado
    When el usuario busca la canción "rock"
    Then la respuesta debería contener una lista de canciones

