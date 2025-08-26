const MOCK_SONGS = [
  { trackId: 1, releaseDate: '2023-01-01', primaryGenreName: 'Pop', artistName: 'Artist A', trackName: 'Song 1' },
  { trackId: 2, releaseDate: '2022-01-01', primaryGenreName: 'Rock', artistName: 'Artist B', trackName: 'Song 2' },
  { trackId: 3, releaseDate: '2023-01-01', primaryGenreName: 'Rock', artistName: 'Artist C', trackName: 'Song 3' },
  { trackId: 4, releaseDate: '2021-01-01', primaryGenreName: 'Pop', artistName: 'Artist A', trackName: 'Song 4' }
];

const HomeComponent = {
  allSongs: [],
  filteredSongs: [],
  totalFilteredSongs: 0,
  currentPage: 1,

  onFilterChange(filters) {
    const { year, genres, artists } = filters;

    this.filteredSongs = this.allSongs.filter(song => {
      const songYear = new Date(song.releaseDate).getFullYear().toString();
      const matchYear = !year || songYear === year;
      const matchGenre = genres.length === 0 || genres.includes(song.primaryGenreName);
      const matchArtist = artists.length === 0 || artists.includes(song.artistName);
      return matchYear && matchGenre && matchArtist;
    });

    this.totalFilteredSongs = this.filteredSongs.length;
    this.currentPage = 1;
  }
};

(function runTests() {
  console.log('Test 1: componente creado');
  console.assert(HomeComponent !== undefined, 'Componente no creado');

  console.log('\nTest 2: filtrado por año 2023');
  HomeComponent.allSongs = [...MOCK_SONGS];
  HomeComponent.filteredSongs = [...MOCK_SONGS];
  HomeComponent.totalFilteredSongs = MOCK_SONGS.length;

  const filters = { year: '2023', genres: [], artists: [] };
  HomeComponent.onFilterChange(filters);

  const expectedSongs = MOCK_SONGS.filter(song =>
    new Date(song.releaseDate).getFullYear().toString() === filters.year
  );

  console.assert(HomeComponent.filteredSongs.length === expectedSongs.length, 'Cantidad incorrecta de canciones filtradas');
  console.assert(JSON.stringify(HomeComponent.filteredSongs) === JSON.stringify(expectedSongs), 'Canciones filtradas incorrectas');
  console.assert(HomeComponent.currentPage === 1, 'Página actual incorrecta');
  console.assert(HomeComponent.totalFilteredSongs === expectedSongs.length, 'Total filtrado incorrecto');

  console.log('Test de filtrado por año pasó correctamente');
})();