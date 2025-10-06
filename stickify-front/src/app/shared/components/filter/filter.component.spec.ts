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
        // Se crea un mock del servicio MusicService.
        const musicServiceMock = {
            getSongs: () => of([]),
            getArtists: () => of([]),
            getGenres: () => of(['Pop', 'Rock', 'Jazz']),
            // Se agrega propiedades de Observable en caso de que el componente
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

        // Elimina el spy global de emitFilters. Usar spies locales en cada test.

        // Se detectan los cambios iniciales para que el componente se inicialice.
        // El mock más completo debería resolver el error de `ngOnInit`.
        fixture.detectChanges();
    });

    // --- Prueba Principal: Lógica de onGenreChange ---

        it('should add a genre to the selectedGenres array and call emitFilters', () => {
            //Arrange
            const initialGenres = ['Pop'];
            component.selectedGenres = [...initialGenres];
            const newGenre = 'Rock';
            const mockEvent = { target: { checked: true } };
            //Spy 
            const emitSpy = spyOn(component as any, 'emitFilters');
            //Act
            component.onGenreChange(newGenre, mockEvent);
            //Assert
            expect(component.selectedGenres).toEqual(['Pop', 'Rock']);
            //Assert
            expect(emitSpy).toHaveBeenCalled();
        });

        it('should remove a genre from the selectedGenres array and call emitFilters', () => {
            //Arrange
            const initialGenres = ['Pop', 'Rock', 'Jazz'];
            component.selectedGenres = [...initialGenres];
            const genreToRemove = 'Rock';
            const mockEvent = { target: { checked: false } };
            //Spy
            const emitSpy = spyOn(component as any, 'emitFilters');
            //Act
            component.onGenreChange(genreToRemove, mockEvent);
            //Assert
            expect(component.selectedGenres).toEqual(['Pop', 'Jazz']);
            //Assert
            expect(emitSpy).toHaveBeenCalled();
        });

        it('should not modify the array if the genre to remove is not present', () => {
            //Arrange
            const initialGenres = ['Pop', 'Jazz'];
            component.selectedGenres = [...initialGenres];
            const genreToRemove = 'Rock';
            const mockEvent = { target: { checked: false } };
            //Spy
            const emitSpy = spyOn(component as any, 'emitFilters');
            //Act
            component.onGenreChange(genreToRemove, mockEvent);
            //Assert
            expect(component.selectedGenres).toEqual(['Pop', 'Jazz']);
            //Assert
            expect(emitSpy).toHaveBeenCalled();
        });
        it('should add an artist to selectedArtists and call emitFilters', () => {
            //Arrange
            component.selectedArtists = ['Artist1'];
            const newArtist = 'Artist2';
            const mockEvent = { target: { checked: true } };
            //Spy
            const emitSpy = spyOn(component as any, 'emitFilters');
            //Act
            component.onArtistChange(newArtist, mockEvent);
            //Assert
            expect(component.selectedArtists).toEqual(['Artist1', 'Artist2']);
            //Assert
            expect(emitSpy).toHaveBeenCalled();
        });

            it('should remove an artist from selectedArtists and call emitFilters', () => {
                //Arrange
                component.selectedArtists = ['Artist1', 'Artist2'];
                const artistToRemove = 'Artist2';
                const mockEvent = { target: { checked: false } };
                //Spy
                const emitSpy = spyOn(component as any, 'emitFilters');
                //Act
                component.onArtistChange(artistToRemove, mockEvent);
                //Assert
                expect(component.selectedArtists).toEqual(['Artist1']);
                //Assert
                expect(emitSpy).toHaveBeenCalled();
            });

            it('should update selectedYear and call emitFilters on year change', () => {
                //Arrange
                const mockEvent = { target: { value: '2023' } };
                //Act
                const emitSpy = spyOn(component as any, 'emitFilters');
                component.onYearChange(mockEvent);
                //Assert
                expect(component.selectedYear).toBe('2023');
                //Assert
                expect(emitSpy).toHaveBeenCalled();
            });

            it('should emit filterChanged event from emitFilters', () => {
                //Arrange
                component.selectedGenres = ['Pop'];
                component.selectedArtists = ['Artist1'];
                component.selectedYear = '2022';
                const emitSpy = spyOn(component.filterChanged, 'emit');
                //Act
                (component as any).emitFilters();
                //Assert
                expect(emitSpy).toHaveBeenCalledWith({ genres: ['Pop'], artists: ['Artist1'], year: '2022' });
            });

    it('should subscribe to genres and artists on ngOnInit', () => {
        //Arrange
        component.genres = [];
        component.artists = [];
        //Act
        component.ngOnInit();
        //Assert
        expect(Array.isArray(component.genres)).toBeTrue();
        //Assert
        expect(Array.isArray(component.artists)).toBeTrue();
    });

    it('should unsubscribe from genres and artists on ngOnDestroy', () => {
        //Arrange
        const genresSub = { unsubscribe: jasmine.createSpy('unsubscribe') };
        const artistsSub = { unsubscribe: jasmine.createSpy('unsubscribe') };
        (component as any).genresSubscription = genresSub;
        (component as any).artistsSubscription = artistsSub;
        //Act
        component.ngOnDestroy();
        //Assert
        expect(genresSub.unsubscribe).toHaveBeenCalled();
        //Assert
        expect(artistsSub.unsubscribe).toHaveBeenCalled();
    });

            it('should toggle filter dropdown and set activeFilter', () => {
                //Arrange
                const mockElement = document.createElement('div');
                // Simula que el filtro no tiene la clase 'show' al inicio
                spyOn(document, 'getElementById').and.returnValue(mockElement);
                //Act
                component.toggleFilter('genre');
                //Assert
                expect(mockElement.classList.contains('show')).toBeTrue();
                //Assert
                expect(component['activeFilter']).toBe('genre');
                //Act
                // Si se llama de nuevo, debe quitar la clase y activeFilter ser null
                component.toggleFilter('genre');
                //Assert
                expect(mockElement.classList.contains('show')).toBeFalse();
                //Assert
                expect(component['activeFilter']).toBeNull();
            });
});