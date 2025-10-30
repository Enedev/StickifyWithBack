import { PageElement, By } from '@serenity-js/web';

export class SearchBar {
    static searchInput = () =>
        PageElement.located(By.css('input[type="search"]'))
            .describedAs('search input');

    static searchButton = () =>
        PageElement.located(By.css('button[type="submit"]'))
            .describedAs('search button');

    static searchResults = () =>
        PageElement.located(By.css('.song-list'))
            .describedAs('search results container');
}