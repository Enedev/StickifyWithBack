Feature: Playlists
  Como usuario
  Quiero crear una playlist
  Para guardar canciones favoritas

  Scenario: Crear una playlist nueva
    Given que el usuario está autenticado
    When crea una playlist con título "Mi Playlist"
    Then la respuesta debería tener código 201 o 200
