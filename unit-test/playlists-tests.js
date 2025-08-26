const mockSong = {
  trackId: 1,
  artistName: 'Test Artist',
  trackName: 'Test Song',
  primaryGenreName: 'Pop',
  collectionName: 'Test Album',
  artworkUrl100: '',
  releaseDate: '2023-01-01',
  isUserUpload: false,
  collectionId: 101,
  artistId: 201
};

const mockPlaylist = {
  id: '123',
  name: 'My Playlist',
  trackIds: [String(mockSong.trackId)],
  type: 'user',
  createdAt: new Date(),
  createdBy: 'testuser'
};

const mockPlaylistApiService = {
  createPlaylist: async (playlist) => {
    console.log('Playlist creada:', playlist);
    return mockPlaylist;
  }
};

let createPlaylistCalled = false;

const PlaylistComponent = {
  selectedSongs: [],
  newPlaylistName: '',
  isSavingPlaylist: false,

  toggleSongSelection(song) {
    const index = this.selectedSongs.findIndex(s => s.trackId === song.trackId);
    if (index === -1) {
      this.selectedSongs.push(song);
    } else {
      this.selectedSongs.splice(index, 1);
    }
  },

  async createPlaylistAndSaveToSupabase() {
    if (!this.newPlaylistName || this.selectedSongs.length === 0) {
      console.log('No se puede crear la playlist: nombre vacío o sin canciones');
      return;
    }

    this.isSavingPlaylist = true;

    const playlist = {
      name: this.newPlaylistName,
      trackIds: this.selectedSongs.map(s => String(s.trackId)),
      createdAt: new Date(),
      createdBy: 'testuser'
    };

    createPlaylistCalled = true;
    await mockPlaylistApiService.createPlaylist(playlist);
    this.isSavingPlaylist = false;
  }
};


(async () => {
  console.log('\nTest 1: agregar canción si no está seleccionada');
  PlaylistComponent.selectedSongs = [];
  PlaylistComponent.toggleSongSelection(mockSong);
  const added = PlaylistComponent.selectedSongs.includes(mockSong);
  console.assert(added, '❌ La canción no fue agregada');
  if (added) console.log('✅ La canción fue agregada correctamente');

  console.log('\nTest 2: quitar canción si ya está seleccionada');
  PlaylistComponent.toggleSongSelection(mockSong);
  const removed = !PlaylistComponent.selectedSongs.includes(mockSong);
  console.assert(removed, '❌ La canción no fue eliminada');
  if (removed) console.log('✅ La canción fue eliminada correctamente');

  console.log('\nTest 3: crear playlist con nombre y canciones válidas');
  PlaylistComponent.newPlaylistName = 'My Playlist';
  PlaylistComponent.selectedSongs = [mockSong];
  createPlaylistCalled = false;
  await PlaylistComponent.createPlaylistAndSaveToSupabase();
  console.assert(createPlaylistCalled, '❌ createPlaylist no fue llamado');
  if (createPlaylistCalled) console.log('✅ createPlaylist fue llamado correctamente');

  console.assert(!PlaylistComponent.isSavingPlaylist, '❌ isSavingPlaylist debería ser false');
  if (!PlaylistComponent.isSavingPlaylist) console.log('✅ isSavingPlaylist está en false como se esperaba');

  console.log('\nTest 4: no crear playlist si no hay canciones');
  PlaylistComponent.newPlaylistName = 'My Playlist';
  PlaylistComponent.selectedSongs = [];
  createPlaylistCalled = false;
  await PlaylistComponent.createPlaylistAndSaveToSupabase();
  console.assert(!createPlaylistCalled, '❌ createPlaylist debería NO haberse llamado');
  if (!createPlaylistCalled) console.log('✅ createPlaylist no fue llamado');

  console.log('\nTest 5: no crear playlist si el nombre está vacío');
  PlaylistComponent.newPlaylistName = '';
  PlaylistComponent.selectedSongs = [mockSong];
  createPlaylistCalled = false;
  await PlaylistComponent.createPlaylistAndSaveToSupabase();
  console.assert(!createPlaylistCalled, '❌ createPlaylist debería NO haberse llamado');
  if (!createPlaylistCalled) console.log('✅ createPlaylist no fue llamado');
})();