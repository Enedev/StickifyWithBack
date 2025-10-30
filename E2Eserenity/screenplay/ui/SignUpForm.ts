import { PageElement, By } from '@serenity-js/web';

export class SignUpForm {
    static usernameInput = () =>
    PageElement.located(By.css('input[formControlName="username"]'))
            .describedAs('username input field');

    static emailInput = () =>
    PageElement.located(By.css('input[formControlName="email"]'))
            .describedAs('email input field');

    static passwordInput = () =>
    PageElement.located(By.css('input[formControlName="password"]'))
            .describedAs('password input field');

    static repeatPasswordInput = () =>
    PageElement.located(By.css('input[formControlName="repeatPassword"]'))
            .describedAs('repeat password input field');

    static submitButton = () =>
    PageElement.located(By.css('button[type="submit"]'))
            .describedAs('sign up button');

        static loginLink = () =>
                PageElement.located(By.css('a[href="/log-in"]'))
                        .describedAs('login link');
}