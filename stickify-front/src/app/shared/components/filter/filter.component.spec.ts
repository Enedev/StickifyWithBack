import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterComponent } from './filter.component';
import { MusicService } from '../../../services/music.service';
import { of } from 'rxjs';

describe('FilterComponent', () => {
    let component: FilterComponent;
    let fixture: ComponentFixture<FilterComponent>;
    let musicService: MusicService;
    let emitFiltersSpy: jasmine.Spy;

    beforeEach(async () => {
        // Se crea un mock del servicio MusicService más completo.
        // Esto ayuda a evitar errores de inicialización si el componente
        // se suscribe a métodos o propiedades en ngOnInit.
        const musicServiceMock = {
            getSongs: () => of([]),
            getArtists: () => of([]),
            getGenres: () => of(['Pop', 'Rock', 'Jazz']),
            // Agregamos propiedades de Observable en caso de que el componente
            // se suscribiera a ellas en ngOnInit.
            songs$: of([]),
            artists$: of([]),
            genres$: of(['Pop', 'Rock', 'Jazz']),
        };

        await TestBed.configureTestingModule({
            imports: [FilterComponent],
            providers: [
                { provide: MusicService, useValue: musicServiceMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(FilterComponent);
        component = fixture.componentInstance;
        musicService = TestBed.inject(MusicService);

        // Se crea un spy para el método `emitFilters` para asegurarnos de que se llama
        // cuando la lógica de `onGenreChange` ha terminado.
        emitFiltersSpy = spyOn(component as any, 'emitFilters');

        // Se detectan los cambios iniciales para que el componente se inicialice.
        // El mock más completo debería resolver el error de `ngOnInit`.
        fixture.detectChanges();
    });

    // --- Prueba Principal: Lógica de onGenreChange ---

    it('should add a genre to the selectedGenres array and call emitFilters', () => {
        // Arrange: Preparar el estado inicial
        const initialGenres = ['Pop'];
        component.selectedGenres = [...initialGenres];
        const newGenre = 'Rock';
        const mockEvent = { target: { checked: true } };

        // Act: Ejecutar la función a probar
        component.onGenreChange(newGenre, mockEvent);

        // Assert: Verificar los resultados esperados
        // Se espera que 'Rock' se haya añadido a la lista
        expect(component.selectedGenres).toEqual(['Pop', 'Rock']);
        // Se espera que `emitFilters` se haya llamado
        expect(emitFiltersSpy).toHaveBeenCalled();
    });

    it('should remove a genre from the selectedGenres array and call emitFilters', () => {
        // Arrange
        const initialGenres = ['Pop', 'Rock', 'Jazz'];
        component.selectedGenres = [...initialGenres];
        const genreToRemove = 'Rock';
        const mockEvent = { target: { checked: false } };

        // Act
        component.onGenreChange(genreToRemove, mockEvent);

        // Assert
        // Se espera que 'Rock' se haya eliminado de la lista
        expect(component.selectedGenres).toEqual(['Pop', 'Jazz']);
        // Se espera que `emitFilters` se haya llamado
        expect(emitFiltersSpy).toHaveBeenCalled();
    });

    it('should not modify the array if the genre to remove is not present', () => {
        // Arrange
        const initialGenres = ['Pop', 'Jazz'];
        component.selectedGenres = [...initialGenres];
        const genreToRemove = 'Rock';
        const mockEvent = { target: { checked: false } };

        // Act
        component.onGenreChange(genreToRemove, mockEvent);

        // Assert
        // Se espera que la lista de géneros seleccionados no haya cambiado
        expect(component.selectedGenres).toEqual(['Pop', 'Jazz']);
        // Se espera que `emitFilters` se haya llamado
        expect(emitFiltersSpy).toHaveBeenCalled();
    });
});