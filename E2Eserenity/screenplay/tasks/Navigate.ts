import { Task } from '@serenity-js/core';
import { Click, Navigate } from '@serenity-js/web';
import { Navigation } from '../ui/Navigation';

export const NavigateTo = {
    login: () =>
        Task.where(`#actor navigates to login`,
            Navigate.to('/log-in'),
        ),

    signUp: () =>
        Task.where(`#actor navigates to sign up`,
            Navigate.to('/sign-up'),
        ),

    home: () =>
        Task.where(`#actor navigates to home`,
            Click.on(Navigation.homeLink()),
        ),

    playlists: () =>
        Task.where(`#actor navigates to playlists`,
            Click.on(Navigation.playlistLink()),
        ),

    follows: () =>
        Task.where(`#actor navigates to follows`,
            Click.on(Navigation.userFollowsLink()),
        ),
};