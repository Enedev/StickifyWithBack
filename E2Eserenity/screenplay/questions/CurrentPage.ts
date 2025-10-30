import { Question } from '@serenity-js/core';
import { Page } from '@serenity-js/web';

export const CurrentPage = {
    path: () =>
        Question.about('current page path',
            async actor => {
                const page = await actor.answer(Page.current());
                return new URL((page as any).url()).pathname;
            }),
};