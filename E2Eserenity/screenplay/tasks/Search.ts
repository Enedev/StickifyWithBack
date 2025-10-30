import { Task } from '@serenity-js/core';
import { Click, Enter } from '@serenity-js/web';
import { SearchBar } from '../ui/SearchBar';

export const Search = {
    forSong: (songName: string) =>
        Task.where(`#actor searches for song ${songName}`,
            Enter.theValue(songName).into(SearchBar.searchInput()),
            Click.on(SearchBar.searchButton())
        )
};