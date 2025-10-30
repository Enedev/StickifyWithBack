import { Task } from '@serenity-js/core';
import { Click, Enter } from '@serenity-js/web';
import { LoginForm } from '../ui/LoginForm';

export const LogIn = {
    withCredentials: (email: string, password: string) =>
        Task.where(`#actor logs in with ${email}`,
            Enter.theValue(email).into(LoginForm.emailInput()),
            Enter.theValue(password).into(LoginForm.passwordInput()),
            Click.on(LoginForm.submitButton())
        )
};