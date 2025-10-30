import { PageElement, By } from '@serenity-js/web';

export class LoginForm {
    static emailInput = () =>
    PageElement.located(By.css('input[formControlName="email"]'))
            .describedAs('email input field');

    static passwordInput = () =>
    PageElement.located(By.css('input[formControlName="password"]'))
            .describedAs('password input field');

    static submitButton = () =>
    PageElement.located(By.css('button[type="submit"]'))
            .describedAs('login button');

    static signUpLink = () =>
    PageElement.located(By.css('a[href="/sign-up"]'))
            .describedAs('sign up link');
}