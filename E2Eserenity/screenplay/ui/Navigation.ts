import { PageElement, By } from '@serenity-js/web';

export class Navigation {
    static homeLink = () =>
    PageElement.located(By.css('.link-home'))
            .describedAs('home link');

    static searchInput = () =>
    PageElement.located(By.css('input[type="search"]'))
            .describedAs('search input');
            
    static playlistLink = () =>
    PageElement.located(By.css('.link-playlist'))
            .describedAs('playlist link');

    static userFollowsLink = () =>
    PageElement.located(By.css('.link-user-follows'))
            .describedAs('user follows link');
}