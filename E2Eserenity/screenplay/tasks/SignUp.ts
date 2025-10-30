import { Task } from '@serenity-js/core';
import { Click, Enter } from '@serenity-js/web';
import { SignUpForm } from '../ui/SignUpForm';

export const SignUp = {
    withCredentials: (username: string, email: string, password: string) =>
        Task.where(`#actor signs up as ${username}`,
            Enter.theValue(username).into(SignUpForm.usernameInput()),
            Enter.theValue(email).into(SignUpForm.emailInput()),
            Enter.theValue(password).into(SignUpForm.passwordInput()),
            Enter.theValue(password).into(SignUpForm.repeatPasswordInput()),
            Click.on(SignUpForm.submitButton())
        )
};