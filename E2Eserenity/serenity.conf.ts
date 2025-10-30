import { configure } from '@serenity-js/core';

configure({
    crew: [
        ['@serenity-js/serenity-bdd', {
            outputDir: 'target/site/serenity'
        }]
    ]
});