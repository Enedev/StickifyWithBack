// Simulación del componente FilterComponent
const FilterComponent = {
  selectedGenres: [],
  emitFiltersCalled: false,

  emitFilters() {
    console.log('emitFilters() llamado');
    this.emitFiltersCalled = true;
  },

  onGenreChange(genre, event) {
    const isChecked = event.target.checked;
    console.log(`Acción: ${isChecked ? 'Agregar' : 'Eliminar'} género "${genre}"`);
    console.log(`Estado inicial: ${JSON.stringify(this.selectedGenres)}`);

    if (isChecked && !this.selectedGenres.includes(genre)) {
      this.selectedGenres.push(genre);
    } else if (!isChecked) {
      const index = this.selectedGenres.indexOf(genre);
      if (index !== -1) {
        this.selectedGenres.splice(index, 1);
      }
    }

    console.log(`Estado final: ${JSON.stringify(this.selectedGenres)}`);
    this.emitFilters();
  },

  reset() {
    this.selectedGenres = [];
    this.emitFiltersCalled = false;
  }
};

// --- Prueba 1: Añadir género ---
console.log('\nTest 1: Añadir género');
FilterComponent.reset();
FilterComponent.selectedGenres = ['Pop'];
FilterComponent.onGenreChange('Rock', { target: { checked: true } });

console.assert(
  JSON.stringify(FilterComponent.selectedGenres) === JSON.stringify(['Pop', 'Rock']),
  'El género "Rock" debería haberse añadido'
);
console.assert(FilterComponent.emitFiltersCalled, 'emitFilters debería haberse llamado');
console.log('Test 1 completado');

// --- Prueba 2: Eliminar género existente ---
console.log('\nTest 2: Eliminar género existente');
FilterComponent.reset();
FilterComponent.selectedGenres = ['Pop', 'Rock', 'Jazz'];
FilterComponent.onGenreChange('Rock', { target: { checked: false } });

console.assert(
  JSON.stringify(FilterComponent.selectedGenres) === JSON.stringify(['Pop', 'Jazz']),
  'El género "Rock" debería haberse eliminado'
);
console.assert(FilterComponent.emitFiltersCalled, 'emitFilters debería haberse llamado');
console.log('Test 2 completado');
